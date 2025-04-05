// Backend/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'travel'
});

// 依搜尋字串前綴查詢電影（保留原有功能）
app.get('/api/movies', (req, res) => {
  const searchTerm = req.query.search || '';
  const sql = 'SELECT * FROM movie WHERE name LIKE ?';
  pool.query(sql, [`${searchTerm}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// 新增：取得所有電影資料
app.get('/api/movies/all', (req, res) => {
  const sql = 'SELECT * FROM movie';
  pool.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
