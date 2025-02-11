const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models.js");

const app = express();
const path = require("path");
const Movie = Models.Movie;
const User = Models.User;

mongoose
  .connect("mongodb://localhost:27017/MovieDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MovieDB"))
  .catch((err) => console.error("Error connecting to MovieDB:", err));

// Middleware
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to MyMovieDATA");
});

// ********** USER ROUTES **********

// Register a new user
app.post("/users", async (req, res) => {
  const { username, email, birthday } = req.body;

  if (!username || !email) {
    return res.status(400).send("Username and email are required");
  }

  try {
    const newUser = new User({
      Username: username,
      Email: email,
      Birthday: birthday ? new Date(birthday) : null,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by username
app.get("/users/:username", async (req, res) => {
  try {
    const user = await User.findOne({ Username: req.params.username });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("No such user");
    }
  } catch (err) {
    res.status(500).send({ error: "Error fetching the user" });
  }
});

// Update user info
app.put("/users/:username/update", async (req, res) => {
  const { username } = req.params;
  const { newUsername, email, birthday } = req.body;

  try {
    const user = await User.findOne({ Username: username });
    if (user) {
      user.Username = newUsername || user.Username;
      user.Email = email || user.Email;
      user.Birthday = birthday || user.Birthday;
      await user.save();
      res.status(200).json({ message: "User info updated", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user's favorite movie
app.put("/users/:username/favoriteMovie", async (req, res) => {
  const { username } = req.params;  // Get username from URL parameters
  const { favoriteMovie } = req.body;  // Get favorite movie from request body

  try {
    // Find user by username
    const user = await User.findOne({ Username: username });
    if (user) {
      // Update the favorite movie
      user.FavoriteMovie = favoriteMovie;
      await user.save();
      res.status(200).json({ message: "Favorite movie updated successfully", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


// Remove a favorite movie
app.put("/users/:username/favorites/remove", async (req, res) => {
  const { username } = req.params;
  const { movieId } = req.body;

  try {
    const user = await User.findOne({ Username: username });
    if (user) {
      user.FavoriteMovies = user.FavoriteMovies.filter(id => id.toString() !== movieId);
      await user.save();
      res.status(200).json({ message: "Movie removed from favorites", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete("/users/:username", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ Username: req.params.username });
    if (user) {
      res.status(200).send(`User ${user.Username} has been removed`);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send({ error: "Error deleting user" });
  }
});

// ********** MOVIE ROUTES **********

// Get all movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get movie by title
app.get("/movies/:title", async (req, res) => {
  try {
    const movie = await Movie.findOne({ Title: req.params.title });
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).send("No such movie");
    }
  } catch (err) {
    res.status(500).send({ error: "Error fetching the movie" });
  }
});

// Get movies by genre
app.get("/movies/genre/:genreName", async (req, res) => {
  try {
    const movies = await Movie.find({ "Genre.Name": req.params.genreName });
    if (movies.length > 0) {
      res.status(200).json(movies);
    } else {
      res.status(404).send(`No movies found for genre: ${req.params.genreName}`);
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies by genre" });
  }
});

// Get movies by director
app.get("/movies/director/:directorName", async (req, res) => {
  try {
    const movies = await Movie.find({ "Director.Name": req.params.directorName });
    if (movies.length > 0) {
      res.status(200).json(movies.map(movie => ({
        Title: movie.Title,
        Description: movie.Description,
        Genre: movie.Genre,
        Director: {
          Name: movie.Director.Name,
          Bio: movie.Director.Bio,
        },
        ImageUrl: movie.ImageUrl,
        Featured: movie.Featured,
      })));
    } else {
      res.status(404).send(`No movies found for director: ${req.params.directorName}`);
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies by director" });
  }
});

// Start server
app.listen(8080, () => console.log("Listening on port 8080"));
