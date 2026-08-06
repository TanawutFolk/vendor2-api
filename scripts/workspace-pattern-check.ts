import fs from 'fs'
import path from 'path'
import ts from 'typescript'

const workspaceRoot = path.resolve(process.cwd(), 'src/_workspace')
const violations: string[] = []

const walkTypeScriptFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walkTypeScriptFiles(entryPath)
    return entry.isFile() && entry.name.endsWith('.ts') ? [entryPath] : []
  })

const relativePath = (filePath: string) => path.relative(process.cwd(), filePath).replaceAll('\\', '/')

const addViolation = (filePath: string, lineNumber: number, message: string) => {
  violations.push(`${relativePath(filePath)}:${lineNumber} ${message}`)
}

const checkLines = (filePath: string, check: (line: string, lineNumber: number) => string | null) => {
  fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .forEach((line, index) => {
      const message = check(line, index + 1)
      if (message) addViolation(filePath, index + 1, message)
    })
}

const files = walkTypeScriptFiles(workspaceRoot)
const sourceFiles = files.filter((filePath) => !filePath.endsWith('.test.ts'))
const filesIn = (layer: string) => sourceFiles.filter((filePath) => relativePath(filePath).includes(`src/_workspace/${layer}/`))

const checkSqlPlaceholderPairing = (filePath: string, content: string) => {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true)

  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
      const placeholders = new Set<string>()
      const replacements = new Set<string>()

      const inspectFunction = (child: ts.Node) => {
        if (ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child)) {
          for (const match of child.text.matchAll(/\bdataItem\.[A-Za-z0-9_]+\b/g)) placeholders.add(match[0])
        }

        if (
          ts.isCallExpression(child) &&
          ts.isPropertyAccessExpression(child.expression) &&
          child.expression.name.text === 'replaceAll' &&
          child.arguments.length > 0 &&
          ts.isStringLiteral(child.arguments[0])
        ) {
          replacements.add(child.arguments[0].text)
        }

        ts.forEachChild(child, inspectFunction)
      }

      inspectFunction(node.initializer)
      const missing = [...placeholders].filter((placeholder) => !replacements.has(placeholder))
      if (missing.length > 0) {
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
        addViolation(filePath, lineNumber, `SQL function does not replace placeholders: ${missing.join(', ')}`)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

filesIn('sql').forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8')
  checkSqlPlaceholderPairing(filePath, content)

  checkLines(filePath, (line) => (line.includes('${') ? 'SQL must use named placeholders and sql.replaceAll; template interpolation is not allowed' : null))
  checkLines(filePath, (line) =>
    /\bdataItem\.SQL_REPLACE[A-Za-z0-9_]*\b/.test(line)
      ? 'SQL placeholders must use their semantic name directly; SQL_REPLACE placeholders are not allowed'
      : null,
  )

  if (content.includes('dataItem.') && !content.includes('.replaceAll(')) {
    addViolation(filePath, 1, 'SQL contains a dataItem placeholder but does not call replaceAll')
  }

  checkLines(filePath, (line) => {
    if (/from ['"][^'"]*(?:controllers|models|services|businessData)\//.test(line)) return 'SQL may not import a higher application layer or a DB executor'
    if (/from ['"]\.\.\/_/.test(line) && !line.includes('../_status-master/')) return 'Feature SQL may not import SQL owned by another feature'
    return null
  })
})

filesIn('services').forEach((filePath) => {
  const serviceSqlPattern = /\b(?:SELECT|INSERT\s+INTO|UPDATE\s+[`A-Za-z_]|DELETE\s+FROM)\b/i
  checkLines(filePath, (line) => {
    if (serviceSqlPattern.test(line)) return 'SQL statements belong in the SQL layer, not in a service'
    if (/from ['"][^'"]*(?:controllers|models)\//.test(line)) return 'Service may not import a controller or model'
    return null
  })
})

filesIn('models').forEach((filePath) => {
  checkLines(filePath, (line) => {
    if (/from ['"][^'"]*(?:controllers|models|sql|businessData)\//.test(line)) return 'Model must remain a thin delegation layer to its service'
    return null
  })
})

filesIn('controllers').forEach((filePath) => {
  checkLines(filePath, (line) => {
    if (/from ['"][^'"]*(?:controllers|services|sql|businessData)\//.test(line)) return 'Controller must call its model rather than another application layer'
    if (/^\s{2}[A-Z][A-Za-z0-9_]*\s*:\s*async\b/.test(line)) return 'Controller action names must start with a lowercase letter'
    return null
  })
})

filesIn('routes').forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8')
  const canonicalRoutes = content.split(/\/\/ Compatibility alias(?:es)?/)[0]

  for (const match of canonicalRoutes.matchAll(/\.(?:post|get)\('([^']+)'/g)) {
    const routePath = match[1]
    if (!/^\/[a-z][A-Za-z0-9]*$/.test(routePath)) {
      const lineNumber = canonicalRoutes.slice(0, match.index).split(/\r?\n/).length
      addViolation(filePath, lineNumber, `Canonical endpoint must be camelCase: ${routePath}`)
    }
  }

  checkLines(filePath, (line) => (/\.(?:put|patch|delete)\(/.test(line) ? 'Workspace API mutations use POST by company convention' : null))
})

sourceFiles
  .filter((filePath) => relativePath(filePath).includes('/_re-register/'))
  .forEach((filePath) => {
    checkLines(filePath, (line) => (/FindVendor|_find-vendor/.test(line) ? 'Re-register must own its endpoint implementation and may not import Find Vendor' : null))
  })

if (violations.length > 0) {
  console.error('Workspace Pattern check failed:')
  violations.forEach((violation) => console.error(`- ${violation}`))
  process.exit(1)
}

console.log(`Workspace Pattern check passed (${sourceFiles.length} source files checked)`)
