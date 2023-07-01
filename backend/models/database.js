const mysql = require('mysql');

const pool = mysql.createPool({
  host: '207.244.239.74',
  user: 'root',
  password: '23Thang8',
  database: 'jx2ib_database'
});

exports.getRoles = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM role', (err, rows) => {
      if (err) {
        console.error(err.message);
        return reject(err);
      }
      resolve(rows);
    });
  });
};
