// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 建立 MySQL 連線池
const pool = mysql.createPool({
  host: '127.0.0.1',
  //host: 'localhost',
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

// 修正: 這個API出現了兩次，移除重複的部分
app.get('/api/movies/all', (req, res) => {
  const sql = 'SELECT * FROM movie'; 
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('🎯 SQL Error:', err.code, err.sqlMessage);
      console.error('📋 Executed SQL:', err.sql);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(`✅ Retrieved ${results.length} movies`);
    res.json(results);
  });
});

app.get('/api/movies/top-by-country/:country', (req, res) => {
  const country = req.params.country.toLowerCase();
  
  const sql = `
    SELECT m.title, m.year, m.vote_average 
    FROM movie m 
    JOIN movie_location_global ml ON m.title = ml.Movie 
    WHERE LOWER(ml.Country) = ?
    ORDER BY m.vote_average DESC
    LIMIT 3
  `;
  
  pool.query(sql, [country], (err, results) => {
    if (err) {
      console.error('Error querying top movies by country:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(`✅ Retrieved top ${results.length} movies for ${country}`);
    res.json(results);
  });
});

app.get('/api/movie-locations/country-ratings', (req, res) => {
  const sql = `
    SELECT LOWER(ml.Country) AS country, ROUND(AVG(m.vote_average), 2) AS avg_movie_rating 
    FROM movie m 
    JOIN movie_location_global ml ON m.title = ml.Movie 
    GROUP BY LOWER(ml.Country) 
    ORDER BY avg_movie_rating DESC
  `;
  
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying country ratings:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(`✅ Retrieved average movie ratings for ${results.length} countries`);
    res.json(results);
  });
});

app.get('/api/movie-locations/country-ratings/filter', (req, res) => {
  const minRating = parseFloat(req.query.minRating) || 0;
  const maxRating = parseFloat(req.query.maxRating) || 10;
  
  const sql = `
    SELECT LOWER(ml.Country) AS country, ROUND(AVG(m.vote_average), 2) AS avg_movie_rating 
    FROM movie m 
    JOIN movie_location_global ml ON m.title = ml.Movie 
    GROUP BY LOWER(ml.Country) 
    HAVING avg_movie_rating >= ? AND avg_movie_rating <= ?
    ORDER BY avg_movie_rating ASC
  `;
  
  pool.query(sql, [minRating, maxRating], (err, results) => {
    if (err) {
      console.error('Error filtering country ratings:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(`✅ Retrieved ${results.length} countries with ratings (range: ${minRating}-${maxRating})`);
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