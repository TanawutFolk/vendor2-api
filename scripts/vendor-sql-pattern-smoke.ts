import fs from 'node:fs'
import path from 'node:path'

const vendorSqlDirs = [
  '_Acc-register',
  '_add-vendor',
  '_approval-GPRC',
  '_approval-queue',
  '_black-list',
  '_Employee-manager',
  '_find-vendor',
  '_request-history',
  '_request-register',
  '_task-manager',
]

const sqlRoot = path.resolve(process.cwd(), 'src/_workspace/sql')

const collectTsFiles = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectTsFiles(fullPath)
    if (!entry.isFile() || !entry.name.endsWith('.ts')) return []
    return [fullPath]
  })
}

const files = vendorSqlDirs.flatMap((dir) => collectTsFiles(path.join(sqlRoot, dir)))

const rules = [
  {
    name: 'no SQL data interfaces',
    pattern: /\b(export\s+)?interface\s+\w+/,
    message: 'SQL files should use dataItem: any instead of declaring interfaces.',
  },
  {
    name: 'no loose helper declarations',
    pattern: /^(const|function|export\s+const\s+[a-z])/m,
    message: 'SQL helpers should be inside the exported SQL object to match the existing SQL file pattern.',
  },
  {
    name: 'no type-only audit import',
    pattern: /import\s+type\s+\{\s*AuditFields\s*\}/,
    message: 'SQL files should not import AuditFields.',
  },
  {
    name: 'no Record utility typing',
    pattern: /\bRecord\s*</,
    message: 'SQL files should use any for local maps in this project pattern.',
  },
  {
    name: 'no Promise<string[]> return annotation',
    pattern: /:\s*Promise\s*<\s*string\[\]\s*>/,
    message: 'SQL methods should not add explicit Promise<string[]> annotations.',
  },
  {
    name: 'no escape SQL helpers',
    pattern: /\b(escapeSqlString|escapeSqlText|escapeSql|const\s+esc\s*=|replaceAll\('\\{2}'|replace\(\/'\/g)/,
    message: 'Vendor SQL should follow existing string replace pattern without escape helpers.',
  },
  {
    name: 'no latest approval by summary',
    pattern: /\b(latestApprovalByExpr|AS\s+APPROVE_BY)\b/i,
    message: 'Summary SQL should not expose APPROVE_BY from request_approval_log.ACTION_BY.',
  },
]

const failures: string[] = []

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const relative = path.relative(process.cwd(), file)

  for (const rule of rules) {
    const match = content.match(rule.pattern)
    if (!match) continue

    const beforeMatch = content.slice(0, match.index)
    const line = beforeMatch.split(/\r?\n/).length
    failures.push(`${relative}:${line} [${rule.name}] ${rule.message}`)
  }
}

if (failures.length > 0) {
  console.error('Vendor SQL pattern smoke failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Vendor SQL pattern smoke passed (${files.length} files checked).`)
