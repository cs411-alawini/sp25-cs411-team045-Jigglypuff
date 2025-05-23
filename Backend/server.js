// server.js
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

app.get('/api/movies', (req, res) => {
  let sql = "SELECT * FROM movie WHERE 1=1";
  const params = [];
  
  // if (req.query.search) {
  //   sql += " AND name LIKE ?";
  //   params.push(req.query.search + '%');
  // }
  if (req.query.search) {
    sql += " AND title LIKE ?";
    // note the % on both sides for substring matching
    params.push(`%${req.query.search}%`);
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
      console.error('searching error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
app.get('/api/hotels/top-by-country/:country', (req, res) => {
  const country = req.params.country.toLowerCase();
  
  const sql = `
    SELECT Hotel_Name, Hotel_Address, Average_Score, City, Id 
    FROM hotel_country_view 
    WHERE country_lower = ?
    ORDER BY Average_Score DESC
    LIMIT 3
  `;
  
  pool.query(sql, [country], (err, results) => {
    if (err) {
      console.error('Error querying top hotels by country:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(`Retrieved top ${results.length} hotels for ${country}`);
    res.json(results);
  });
});

// Retrieve the list of all hotels in a specific country
app.get('/api/hotels/by-country/:country', (req, res) => {
  const country = req.params.country.toLowerCase();
  
  const sql = `
    SELECT Id, Hotel_Name, Hotel_Address, Average_Score, City 
    FROM hotel_country_view 
    WHERE country_lower = ?
    ORDER BY Hotel_Name
  `;
  
  pool.query(sql, [country], (err, results) => {
    if (err) {
      console.error('Error querying hotels by country:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});
app.get('/api/rating-history', (req, res) => {
  pool.query('SELECT * FROM hotel_rating_history ORDER BY update_time DESC LIMIT 20', (err, results) => {
    if (err) {
      console.error('Error fetching rating history:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});
// Retrieve the detailed information of a specific hotel.
app.get('/api/hotels/:id', (req, res) => {
  const hotelId = req.params.id;
  
  const sql = `
    SELECT Id, Hotel_Name, Hotel_Address, Average_Score, City, Hotel_country 
    FROM hotels 
    WHERE Id = ?
  `;
  
  pool.query(sql, [hotelId], (err, results) => {
    if (err) {
      console.error('Error querying hotel details:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(results[0]);
  });
});

// Update the hotel rating
app.put('/api/hotels/:id/rating', (req, res) => {
  const hotelId = req.params.id;
  const { newRating } = req.body;
  
  // Validate the rating value
  const rating = parseFloat(newRating);
  if (isNaN(rating) || rating < 0 || rating > 10) {
    return res.status(400).json({ error: 'Invalid rating value' });
  }
  
  const sql = `
    UPDATE hotels 
    SET Average_Score = ? 
    WHERE Id = ?
  `;
  
  pool.query(sql, [rating, hotelId], (err, results) => {
    if (err) {
      console.error('Error updating hotel rating:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json({ 
      message: 'Hotel rating updated successfully',
      hotelId,
      newRating: rating
    });
  });
});

// Retrieve the list of all countries
app.get('/api/countries', (req, res) => {
  const sql = `
    SELECT DISTINCT Hotel_country, LOWER(Hotel_country) AS country_lower
    FROM hotels
    WHERE Hotel_country IS NOT NULL
    ORDER BY Hotel_country
  `;
  
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching countries:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    res.json(results);
  });
});
app.get('/api/movies/all', (req, res) => {
  const sql = 'SELECT * FROM movie'; 
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err.code, err.sqlMessage);
      console.error('Executed SQL:', err.sql);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(`Retrieved ${results.length} movies`);
    res.json(results);
  });
});
app.get('/api/hotels/top-by-country/:country', (req, res) => {
  const country = req.params.country.toLowerCase();
  
  const sql = `
    SELECT Hotel_Name, Hotel_Address, Average_Score, City 
    FROM hotels 
    WHERE LOWER(Hotel_country) = ?
    ORDER BY Average_Score DESC
    LIMIT 3
  `;
  
  pool.query(sql, [country], (err, results) => {
    if (err) {
      console.error('Error querying top hotels by country:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    console.log(`Retrieved top ${results.length} hotels for ${country}`);
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
    console.log(`Retrieved top ${results.length} movies for ${country}`);
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
    console.log(`Retrieved average movie ratings for ${results.length} countries`);
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
    console.log(`Retrieved ${results.length} countries with ratings (range: ${minRating}-${maxRating})`);
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

// list of cities with both airports and movie locations
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
        console.error('fail to load favorites:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Added to favorite' });
    }
  );
});

/**
 * GET  /api/favorites
 * return favorite table all data
 */
app.get('/api/favorites', (req, res) => {
  pool.query('SELECT * FROM favorite', (err, rows) => {
    if (err) {
      console.error('fail to load favorites:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * DELETE /api/favorites/:movieId
 *  Id_movies delete or favorite
 */
app.delete('/api/favorites/:movieId', (req, res) => {
  const movieId = req.params.movieId;
  pool.query(
    'DELETE FROM favorite WHERE Id_movies = ?',
    [movieId],
    (err) => {
      if (err) {
        console.error('Failed to delete favorite:', err);
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