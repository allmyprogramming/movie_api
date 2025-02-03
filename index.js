
const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  morgan = require("morgan");

const app = express();

// Use Morgan middleware for logging requests
app.use(morgan("common"));
app.use(bodyParser.json());

let movies = [
  {

    Title: "Inception",
    Description: "A thief who enters the dreams of others to steal secrets.",
    Genre: { Name: "Sci-Fi", Description: "Science fiction movies explore futuristic concepts." },
    Director: { Name: "Christopher Nolan", Bio: "British-American director", birthYear: 1970 },
    ImageUrl: "https://image.url/inception.jpg",
    Featured: true,
  },
  {

    Title: "The Dark Knight",
    Description: "Batman faces the Joker, who seeks to create chaos in Gotham.",
    Genre: { Name: "Action", Description: "Action-packed movies with intense sequences." },
    Director: { Name: "Christopher Nolan", Bio: "British-American director", birthYear: 1970 },
    ImageUrl: "https://image.url/darkknight.jpg",
    Featured: false,
  },
  {

    Title: "Interstellar",
    Description: "A team of astronauts travels through a wormhole to find a new home for humanity.",
    Genre: { Name: "Sci-Fi", Description: "Exploring deep space and time travel." },
    Director: { Name: "Christopher Nolan", Bio: "British-American director", birthYear: 1970 },
    ImageUrl: "https://image.url/interstellar.jpg",
    Featured: true,
  },
  {
    Title: "The Matrix",
    Description: "A hacker discovers the truth about his reality and fights against its controllers.",
    Genre: { Name: "Sci-Fi", Description: "A world where reality is an illusion created by AI." },
    Director: { Name: "Lana Wachowski", Bio: "American filmmaker and writer", birthYear: 1965 },
    ImageUrl: "https://image.url/matrix.jpg",
    Featured: false,
  },
  {
    Title: "Pulp Fiction",
    Description: "A series of interwoven crime stories in Los Angeles.",
    Genre: { Name: "Crime", Description: "Stories revolving around criminal activities." },
    Director: { Name: "Quentin Tarantino", Bio: "American filmmaker known for his unique storytelling.", birthYear: 1963 },
    ImageUrl: "https://image.url/pulpfiction.jpg",
    Featured: true,
  },
  {
    Title: "The Lord of the Rings: The Fellowship of the Ring",
    Description: "A hobbit embarks on a quest to destroy a powerful ring.",
    Genre: { Name: "Fantasy", Description: "Epic adventures in magical worlds." },
    Director: { Name: "Peter Jackson", Bio: "New Zealand filmmaker and director of the LOTR trilogy.", birthYear: 1961 },
    ImageUrl: "https://image.url/lotr.jpg",
    Featured: true,
  },
  {
    Title: "The Godfather",
    Description: "The powerful saga of a crime family and its patriarch.",
    Genre: { Name: "Crime", Description: "Classic crime dramas exploring the mafia underworld." },
    Director: { Name: "Francis Ford Coppola", Bio: "American director known for The Godfather trilogy.", birthYear: 1939 },
    ImageUrl: "https://image.url/godfather.jpg",
    Featured: true,
  },
  {
    Title: "Forrest Gump",
    Description: "A simple man with a big heart experiences key moments in American history.",
    Genre: { Name: "Drama", Description: "Emotional and character-driven storytelling." },
    Director: { Name: "Robert Zemeckis", Bio: "American filmmaker known for emotional storytelling.", birthYear: 1952 },
    ImageUrl: "https://image.url/forrestgump.jpg",
    Featured: true,
  },
  {
    Title: "The Shawshank Redemption",
    Description: "A man wrongly convicted of murder forms a friendship in prison.",
    Genre: { Name: "Drama", Description: "Powerful stories of human resilience and hope." },
    Director: { Name: "Frank Darabont", Bio: "French-American director known for prison dramas.", birthYear: 1959 },
    ImageUrl: "https://image.url/shawshank.jpg",
    Featured: true,
  },
  {
    Title: "Fight Club",
    Description: "An insomniac and a soap salesman start an underground fight club.",
    Genre: { Name: "Drama", Description: "Psychological thrillers that challenge societal norms." },
    Director: { Name: "David Fincher", Bio: "American filmmaker known for dark and stylish films.", birthYear: 1962 },
    ImageUrl: "https://image.url/fightclub.jpg",
    Featured: false,
  }
];

let users = [];

// Register a new user
app.post("/users", (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).send("Username and email are required");
  }

  const newUser = {
    id: uuid.v4(),
    username,
    email,
    favoriteMovies: [],
  };

  users.push(newUser);
  res.status(201).json({ message: "User registered successfully", user: newUser });
});

// Update username
app.put("/users/:username", (req, res) => {
  const { username } = req.params;
  const { newUsername } = req.body;

  let user = users.find((u) => u.username === username);

  if (user) {
    user.username = newUsername;
    res.status(200).json({ message: "Username updated successfully", user });
  } else {
    res.status(404).send("User not found");
  }
});

// Add favorite movie
app.post("/users/:username/favorites/:movieTitle", (req, res) => {
  const { username, movieTitle } = req.params;
  let user = users.find((u) => u.username === username);
  let movie = movies.find((m) => m.Title === movieTitle);

  if (user && movie) {
    if (!user.favoriteMovies.includes(movieTitle)) {
      user.favoriteMovies.push(movieTitle);
    }
    res.status(200).send(`${movieTitle} has been added to ${username}'s favorite movies`);
  } else {
    res.status(404).send("User or movie not found");
  }
});

// Remove favorite movie
app.delete("/users/:username/favorites/:movieTitle", (req, res) => {
  const { username, movieTitle } = req.params;
  let user = users.find((u) => u.username === username);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter((title) => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from ${username}'s favorite movies`);
  } else {
    res.status(404).send("User not found");
  }
});

// Delete user
app.delete("/users/:username", (req, res) => {
  const { username } = req.params;
  let userIndex = users.findIndex((u) => u.username === username);

  if (userIndex !== -1) {
    const removedUser = users.splice(userIndex, 1);
    res.status(200).send(`User with email ${removedUser[0].email} has been removed`);
  } else {
    res.status(404).send("User not found");
  }
});

// Get all movies
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// Get movie by title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((m) => m.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).send("No such movie");
  }
});

// Get genre by name
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const movie = movies.find((m) => m.Genre.Name === genreName);

  if (movie) {
    res.status(200).json(movie.Genre);
  } else {
    res.status(404).send({ error: "Genre not found" });
  }
});

app.listen(8080, () => console.log("Listening on port 8080"));
