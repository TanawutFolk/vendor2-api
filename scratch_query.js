const mysql = require('mysql2/promise');

async function queryStatus() {
  const connection = await mysql.createConnection({
    host: '192.168.14.236',
    user: 'Tanawut',
    password: 'Tanawut12345',
    database: '_test_suply_chain_trainee'
  });

  const [rows] = await connection.execute('SELECT * FROM m_request_status');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

queryStatus().catch(console.error);
