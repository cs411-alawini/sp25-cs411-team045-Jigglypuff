// Backend/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: '127.0.0.1',
  //host: 'localhost',
  user: 'root',
  password: '',
  database: 'travel'
});

// 新增：搜尋電影資料
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
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});


// 新增：取得所有電影資料
// Backend/server.js
app.get('/api/movies/all', (req, res) => {
  const sql = 'SELECT * FROM movie';  // 確認這個 table 名稱正確
  pool.query(sql, (err, results) => {
    if (err) {
      // 印出 MySQL 回傳的錯誤訊息、錯誤代碼與執行的 SQL
      console.error('🎯 SQL Error:', err.code, err.sqlMessage);
      console.error('📋 Executed SQL:', err.sql);
      // 回傳一個較簡潔的錯誤給前端
      return res.status(500).json({ error: 'Database query failed' });
    }
    // 若成功，印一下回傳筆數方便確認
    console.log(`✅ Retrieved ${results.length} movies`);
    res.json(results);
  });
});
// stored procedure
app.get('/api/flights/origins', (req, res) => {
  pool.query('SELECT DISTINCT Origin FROM flight', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.Origin));
  });
});

app.get('/api/flights/beforeAvg/:origin', (req, res) => {
  const origin = req.params.origin;
  pool.query('CALL GetFlightsBeforeAvg(?)', [origin], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const flights = Array.isArray(results) ? results[0] : [];
    res.json(flights);
  });
});

// Better API route in server.js
app.get('/api/cities', (req, res) => {
  const sql = `
    SELECT DISTINCT LOWER(a.City) AS city
    FROM airport_new a
    JOIN movie_location_new ml
    ON LOWER(a.City) = LOWER(ml.Locations)
    WHERE a.City IS NOT NULL
    ORDER BY city
  `;

  pool.query(sql, (err, results) => {
    if (err) {
      console.error('City fetch error:', err);
      return res.status(500).json({ error: err });
    }
    const cities = results.map(row => row.city);
    res.json(cities);
  });
});

// Search movies by city (Location)
app.get('/api/movies-by-city/:city', (req, res) => {
  const city = req.params.city.toLowerCase(); // make it case-insensitive
  const sql = `
    SELECT ml.Movie, ml.Locations, cf.flight_count
    FROM movie_location_new ml
    JOIN (
      SELECT LOWER(City) AS city_name, COUNT(*) AS flight_count
      FROM airport_new
      WHERE City IS NOT NULL
      GROUP BY LOWER(City)
    ) cf
    ON LOWER(ml.Locations) = cf.city_name
    WHERE cf.city_name = ?
  `;

  pool.query(sql, [city], (err, results) => {
    if (err) {
      console.error('search error:', err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
