// Backend/favorite.js
const express = require('express');
const mysql = require('mysql2');

const router = express.Router();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'travel'
}).promise();

// add favorite movies
router.post('/', async (req, res) => {
    const { movieId, title } = req.body;
    try {
      await db.query(
        'INSERT INTO favorite (Id_movies, title) VALUES (?, ?)',
        [movieId, title]
      );
      res.status(201).json({ message: 'Added to favorite' });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  
  // get favorite movies
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM favorite');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  
  // remove favorite movies
  router.delete('/:movieId', async (req, res) => {
    const { movieId } = req.params;
    try {
      await db.query('DELETE FROM favorite WHERE Id_movies = ?', [movieId]);
      res.json({ message: 'Removed from favorite' });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  
  module.exports = router;