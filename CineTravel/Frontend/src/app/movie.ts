// src/app/movie.ts
export interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  director: string;
  rating: number;
  location: string;  
  mainActor: string; 
  vote_average?: number;
}

export const movies: Movie[] = [
  { id: 1, title: 'The Shawshank Redemption', genre: 'Drama', year: 1994, director: 'Frank Darabont', rating: 9.3, location: 'USA', mainActor: 'Tim Robbins' },
  { id: 2, title: 'The Dark Knight', genre: 'Action', year: 2008, director: 'Christopher Nolan', rating: 9.0, location: 'USA', mainActor: 'Christian Bale' },
  { id: 3, title: 'Inception', genre: 'Sci-Fi', year: 2010, director: 'Christopher Nolan', rating: 8.8, location: 'USA', mainActor: 'Leonardo DiCaprio' },
  { id: 4, title: 'The Godfather', genre: 'Crime', year: 1972, director: 'Francis Ford Coppola', rating: 9.2, location: 'USA', mainActor: 'Marlon Brando' },
  { id: 5, title: 'Forrest Gump', genre: 'Drama', year: 1994, director: 'Robert Zemeckis', rating: 8.8, location: 'USA', mainActor: 'Tom Hanks' },
  { id: 6, title: 'Pulp Fiction', genre: 'Crime', year: 1994, director: 'Quentin Tarantino', rating: 8.9, location: 'USA', mainActor: 'John Travolta' },
  { id: 7, title: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy', year: 2003, director: 'Peter Jackson', rating: 8.9, location: 'New Zealand', mainActor: 'Elijah Wood' },
  { id: 8, title: 'Fight Club', genre: 'Drama', year: 1999, director: 'David Fincher', rating: 8.8, location: 'USA', mainActor: 'Brad Pitt' },
  { id: 9, title: 'The Matrix', genre: 'Action', year: 1999, director: 'Lana Wachowski, Lilly Wachowski', rating: 8.7, location: 'Australia', mainActor: 'Keanu Reeves' },
  { id: 10, title: 'Interstellar', genre: 'Sci-Fi', year: 2014, director: 'Christopher Nolan', rating: 8.6, location: 'USA', mainActor: 'Matthew McConaughey' },
];
