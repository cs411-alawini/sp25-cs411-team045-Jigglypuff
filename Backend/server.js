// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 建立 MySQL 連線池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'travel'
});



app.get('/api/movies', (req, res) => {
  let sql = "SELECT * FROM movie WHERE 1=1";
  const params = [];
  
  if (req.query.search) {
    sql += " AND name LIKE ?";
    params.push(req.query.search + '%');
  }
  if (req.query.genre) {
    sql += " AND genre = ?";
    params.push(req.query.genre);
  }
  if (req.query.year) {
    sql += " AND year = ?";
    params.push(req.query.year);
  }
  if (req.query.location) {
    sql += " AND location = ?";
    params.push(req.query.location);
  }
  
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('查詢錯誤:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/movies/all', (req, res) => {
  pool.query('SELECT * FROM movie', (err, results) => {
    if (err) {
      console.error('查詢錯誤:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


/**
 * POST   /api/favorites
 * body: { movieId: number, title: string }
 */
app.post('/api/favorites', (req, res) => {
  const { movieId, title } = req.body;
  pool.query(
    'INSERT INTO favorite (Id_movies, title) VALUES (?, ?)',
    [movieId, title],
    (err) => {
      if (err) {
        console.error('加入收藏失敗:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Added to favorite' });
    }
  );
});

/**
 * GET  /api/favorites
 * 回傳 favorite table 全部資料
 */
app.get('/api/favorites', (req, res) => {
  pool.query('SELECT * FROM favorite', (err, rows) => {
    if (err) {
      console.error('讀取收藏失敗:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * DELETE /api/favorites/:movieId
 * 以電影 Id_movies 刪除收藏
 */
app.delete('/api/favorites/:movieId', (req, res) => {
  const movieId = req.params.movieId;
  pool.query(
    'DELETE FROM favorite WHERE Id_movies = ?',
    [movieId],
    (err) => {
      if (err) {
        console.error('刪除收藏失敗:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Removed from favorite' });
    }
  );
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
