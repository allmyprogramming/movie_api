const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./MongoDB/models.js");

const path = require('path');
const Movie = Models.Movie;
const User = Models.User;
const Genres = Models.Genres;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/MongoDB');


// Use Morgan middleware for logging requests
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(express.static('public'));

let users = [];


app.get("/", (req, res) => {
  res.send("Welcome to MyMovieDATA");
});


// Register a new user
app.post("/users", async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).send("Username and email are required");
  }

  try {
    const newUser = new User({
      username,
      email,
      favoriteMovies: [],
    });

    await newUser.save(); // Save user to database
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Update username
app.put("/users/:username", async (req, res) => {
  const { username } = req.params;
  const { newUsername } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (user) {
      user.username = newUsername;
      await user.save(); // Save updated user to database
      res.status(200).json({ message: "Username updated successfully", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Add favorite movie
app.post("/users/:username/favorites/:movieTitle", async (req, res) => {
  const { username, movieTitle } = req.params;
  try {
    const user = await User.findOne({ username: username });
    const movie = await Movie.findOne({ Title: movieTitle });

    if (user && movie) {
      if (!user.favoriteMovies.includes(movieTitle)) {
        user.favoriteMovies.push(movieTitle);
        await user.save(); // Save updated user with the favorite movie
      }
      res.status(200).send(`${movieTitle} has been added to ${username}'s favorite movies`);
    } else {
      res.status(404).send("User or movie not found");
    }
  } catch (err) {
    res.status(500).send({ error: "Error adding favorite movie" });
  }
});

// Remove favorite movie
app.delete("/users/:username/favorites/:movieTitle", async (req, res) => {
  const { username, movieTitle } = req.params;
  try {
    const user = await User.findOne({ username: username });

    if (user) {
      user.favoriteMovies = user.favoriteMovies.filter((title) => title !== movieTitle);
      await user.save(); // Save updated user with removed favorite movie
      res.status(200).send(`${movieTitle} has been removed from ${username}'s favorite movies`);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send({ error: "Error removing favorite movie" });
  }
});

// Delete user
app.delete("/users/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOneAndDelete({ username: username });
    if (user) {
      res.status(200).send(`User with email ${user.email} has been removed`);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send({ error: "Error deleting user" });
  }
});

// Get all movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Get movie by title
app.get("/movies/:title", async (req, res) => {
  const { title } = req.params;
  try {
    const movie = await Movie.findOne({ Title: title });
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).send("No such movie");
    }
  } catch (err) {
    res.status(500).send({ error: "Error fetching the movie" });
  }
});

// Get genre by name
app.get("/movies/genre/:genreName", async (req, res) => {
  const { genreName } = req.params;
  try {
    const movie = await Movie.findOne({ 'Genre.Name': genreName });
    if (movie) {
      res.status(200).json(movie.Genre);
    } else {
      res.status(404).send({ error: "Genre not found" });
    }
  } catch (err) {
    res.status(500).send({ error: "Error fetching genre" });
  }
});

// Start server
app.listen(8080, () => console.log("Listening on port 8080"));
