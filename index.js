const express = require("express");
    bodyParser = require("body-parser");
    uuid = require("uuid");
    morgan = require('morgan');

// Initialize Express
const app = express();

// Use Morgan middleware for logging requests
app.use(morgan('common'));

app.use(bodyParser.json());

let movies = [
  {

    title: "Inception",
    description: "A thief who enters the dreams of others to steal secrets.",
    genre: { name: "Sci-Fi", description: "Science fiction movies explore futuristic concepts." },
    director: { name: "Christopher Nolan", bio: "British-American director", birthYear: 1970 },
    imageUrl: "https://image.url/inception.jpg",
    featured: true,
  },
  {

    title: "The Dark Knight",
    description: "Batman faces the Joker, who seeks to create chaos in Gotham.",
    genre: { name: "Action", description: "Action-packed movies with intense sequences." },
    director: { name: "Christopher Nolan", bio: "British-American director", birthYear: 1970 },
    imageUrl: "https://image.url/darkknight.jpg",
    featured: false,
  },
  {

    title: "Interstellar",
    description: "A team of astronauts travels through a wormhole to find a new home for humanity.",
    genre: { name: "Sci-Fi", description: "Exploring deep space and time travel." },
    director: { name: "Christopher Nolan", bio: "British-American director", birthYear: 1970 },
    imageUrl: "https://image.url/interstellar.jpg",
    featured: true,
  },
  {
    title: "The Matrix",
    description: "A hacker discovers the truth about his reality and fights against its controllers.",
    genre: { name: "Sci-Fi", description: "A world where reality is an illusion created by AI." },
    director: { name: "Lana Wachowski", bio: "American filmmaker and writer", birthYear: 1965 },
    imageUrl: "https://image.url/matrix.jpg",
    featured: false,
  },
  {
    title: "Pulp Fiction",
    description: "A series of interwoven crime stories in Los Angeles.",
    genre: { name: "Crime", description: "Stories revolving around criminal activities." },
    director: { name: "Quentin Tarantino", bio: "American filmmaker known for his unique storytelling.", birthYear: 1963 },
    imageUrl: "https://image.url/pulpfiction.jpg",
    featured: true,
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    description: "A hobbit embarks on a quest to destroy a powerful ring.",
    genre: { name: "Fantasy", description: "Epic adventures in magical worlds." },
    director: { name: "Peter Jackson", bio: "New Zealand filmmaker and director of the LOTR trilogy.", birthYear: 1961 },
    imageUrl: "https://image.url/lotr.jpg",
    featured: true,
  },
  {
    title: "The Godfather",
    description: "The powerful saga of a crime family and its patriarch.",
    genre: { name: "Crime", description: "Classic crime dramas exploring the mafia underworld." },
    director: { name: "Francis Ford Coppola", bio: "American director known for The Godfather trilogy.", birthYear: 1939 },
    imageUrl: "https://image.url/godfather.jpg",
    featured: true,
  },
  {
    title: "Forrest Gump",
    description: "A simple man with a big heart experiences key moments in American history.",
    genre: { name: "Drama", description: "Emotional and character-driven storytelling." },
    director: { name: "Robert Zemeckis", bio: "American filmmaker known for emotional storytelling.", birthYear: 1952 },
    imageUrl: "https://image.url/forrestgump.jpg",
    featured: true,
  },
  {
    title: "The Shawshank Redemption",
    description: "A man wrongly convicted of murder forms a friendship in prison.",
    genre: { name: "Drama", description: "Powerful stories of human resilience and hope." },
    director: { name: "Frank Darabont", bio: "French-American director known for prison dramas.", birthYear: 1959 },
    imageUrl: "https://image.url/shawshank.jpg",
    featured: true,
  },
  {
    title: "Fight Club",
    description: "An insomniac and a soap salesman start an underground fight club.",
    genre: { name: "Drama", description: "Psychological thrillers that challenge societal norms." },
    director: { name: "David Fincher", bio: "American filmmaker known for dark and stylish films.", birthYear: 1962 },
    imageUrl: "https://image.url/fightclub.jpg",
    featured: false,
  }
];

let users = [];


// Read movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//Read
app.get('/movies/:title', (req, res), (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }

});

// Get genre description by name
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.genre.name === genreName ).genre;
  if (genre) {
    res.status(200).json(genre);
  } else { res.status(400).send("Genre not found");
  }
});


app.listen(8080, () => console.log("listening on 8080"));

