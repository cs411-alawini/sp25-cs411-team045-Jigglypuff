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
  password: '',
  database: 'travel'
});

// 依搜尋條件查詢電影
app.get('/api/movies', (req, res) => {
  // 基本查詢語句，使用 WHERE 1=1 方便後續條件串接
  let sql = "SELECT * FROM movie WHERE 1=1";
  const params = [];
  
  // 如果有搜尋字串，依 name 進行模糊查詢
  if (req.query.search) {
    sql += " AND name LIKE ?";
    params.push(req.query.search + '%');
  }
  // 如果有指定 genre，則加入條件
  if (req.query.genre) {
    sql += " AND genre = ?";
    params.push(req.query.genre);
  }
  // 如果有指定 year，則加入條件
  if (req.query.year) {
    sql += " AND year = ?";
    params.push(req.query.year);
  }
  // 如果有指定 location，則加入條件
  if (req.query.location) {
    sql += " AND location = ?";
    params.push(req.query.location);
  }
  
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('查詢錯誤:', err);
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
