// src/app/movie.ts
export interface Movie {
  id_movies: number,
  title: string,
  vote_average: number,
  director_id: number,
  year: number,
  month: string,
  day: string,
  director_name: string,
}

// export const movies: Movie[] = [
//   { id: 1, title: 'The Shawshank Redemption', genre: 'Drama', year: 1994, director: 'Frank Darabont', rating: 9.3, location: 'USA', mainActor: 'Tim Robbins', likes: 10},
//   { id: 2, title: 'The Dark Knight', genre: 'Action', year: 2008, director: 'Christopher Nolan', rating: 9.0, location: 'USA', mainActor: 'Christian Bale', likes: 9},
//   { id: 3, title: 'Inception', genre: 'Sci-Fi', year: 2010, director: 'Christopher Nolan', rating: 8.8, location: 'USA', mainActor: 'Leonardo DiCaprio', likes: 2},
//   { id: 4, title: 'The Godfather', genre: 'Crime', year: 1972, director: 'Francis Ford Coppola', rating: 9.2, location: 'USA', mainActor: 'Marlon Brando', likes: 4 },
//   { id: 5, title: 'Forrest Gump', genre: 'Drama', year: 1994, director: 'Robert Zemeckis', rating: 8.8, location: 'USA', mainActor: 'Tom Hanks', likes: 4 },
//   { id: 6, title: 'Pulp Fiction', genre: 'Crime', year: 1994, director: 'Quentin Tarantino', rating: 8.9, location: 'USA', mainActor: 'John Travolta',likes: 4 },
//   { id: 7, title: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy', year: 2003, director: 'Peter Jackson', rating: 8.9, location: 'New Zealand', mainActor: 'Elijah Wood',likes: 4  },
//   { id: 8, title: 'Fight Club', genre: 'Drama', year: 1999, director: 'David Fincher', rating: 8.8, location: 'USA', mainActor: 'Brad Pitt',likes: 4  },
//   { id: 9, title: 'The Matrix', genre: 'Action', year: 1999, director: 'Lana Wachowski, Lilly Wachowski', rating: 8.7, location: 'Australia', mainActor: 'Keanu Reeves' ,likes: 4 },
//   { id: 10, title: 'Interstellar', genre: 'Sci-Fi', year: 2014, director: 'Christopher Nolan', rating: 8.6, location: 'USA', mainActor: 'Matthew McConaughey' ,likes: 4 },
// ];
