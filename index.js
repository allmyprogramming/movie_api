const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");

const path = require("path");
const Movie = Models.Movie;
const User = Models.User;

mongoose
  .connect("mongodb://localhost:27017/MovieDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MovieDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Use Morgan middleware for logging requests
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to MyMovieDATA");
});

// Register a new user
app.post("/users", async (req, res) => {
  const { name, email, favoriteMovie, birthday, isActive } = req.body;

  // Validate required fields
  if (!name || !email || !favoriteMovie || !birthday) {
    return res.status(400).send("Name, email, favoriteMovie, and birthday are required");
  }

  try {
    // Create a new user with the validated data
    const newUser = new User({
      Name: name,
      Email: email,
      FavoriteMovie: favoriteMovie,
      Birthday: new Date(birthday),  // Ensure the birthday is stored as a Date object
      IsActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    });

    await newUser.save(); // Save user to database
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Get user by email
app.get("/users/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ Email: email });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send("No such user");
    }
  } catch (err) {
    res.status(500).send({ error: "Error fetching the user" });
  }
});

// Update user's favorite movie
app.put("/users/:email/favoriteMovie", async (req, res) => {
  const { email } = req.params;
  const { favoriteMovie } = req.body;

  try {
    const user = await User.findOne({ Email: email });
    if (user) {
      user.FavoriteMovie = favoriteMovie;
      await user.save(); // Save updated user to database
      res.status(200).json({ message: "Favorite movie updated successfully", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Update user info (name, email, favorite movie, birthday)
app.put("/users/:email/update", async (req, res) => {
  const { email } = req.params;
  const { name, newEmail, favoriteMovie, birthday } = req.body;

  try {
    const user = await User.findOne({ Email: email });
    if (user) {
      user.Name = name || user.Name;
      user.Email = newEmail || user.Email;
      user.FavoriteMovie = favoriteMovie || user.FavoriteMovie;
      user.Birthday = birthday || user.Birthday;
      await user.save();
      res.status(200).json({ message: "User info updated", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Deactivate user
app.put("/users/:email/deactivate", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ Email: email });
    if (user) {
      user.IsActive = false;
      await user.save(); // Save updated user to database
      res.status(200).json({ message: "User deactivated successfully", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Delete user
app.delete("/users/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOneAndDelete({ Email: email });
    if (user) {
      res.status(200).send(`User with email ${user.Email} has been removed`);
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

// Get movies by genre
app.get("/movies/genre/:genreName", async (req, res) => {
  const { genreName } = req.params;

  try {
    const movies = await Movie.find({ "Genre.Name": genreName });

    if (movies.length > 0) {
      res.status(200).json(movies);
    } else {
      res.status(404).send(`No movies found for genre: ${genreName}`);
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies by genre" });
  }
});

// Get movies by director name and include director's bio
app.get("/movies/director/:directorName", async (req, res) => {
  const { directorName } = req.params;

  try {
    // Query movies by director's name
    const movies = await Movie.find({ "Director.Name": directorName });

    // If movies are found
    if (movies.length > 0) {
      // Get the director's bio from the first movie's Director field
      const directorBio = movies[0].Director.Bio;

      // Create a response object
      const response = movies.map(movie => ({
        Title: movie.Title,
        Description: movie.Description,
        Genre: movie.Genre,
        Director: {
          Name: movie.Director.Name,
          Bio: directorBio, // Include bio for all the movies of this director
        },
        ImageUrl: movie.ImageUrl,
        Featured: movie.Featured
      }));

      res.status(200).json(response);
    } else {
      res.status(404).send(`No movies found for director: ${directorName}`);
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies by director" });
  }
});


// Add a movie to user's favorites
app.put("/users/:email/addFavoriteMovie", async (req, res) => {
  const { email } = req.params;
  const { favoriteMovie } = req.body;

  try {
    const user = await User.findOne({ Email: email });
    if (user) {
      user.FavoriteMovie = favoriteMovie;
      await user.save();
      res.status(200).json({ message: "Movie added to favorites", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Remove a movie from user's favorites
app.put("/users/:email/removeFavoriteMovie", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ Email: email });
    if (user) {
      user.FavoriteMovie = null; // Removes the movie from the favorites
      await user.save();
      res.status(200).json({ message: "Movie removed from favorites", user });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Start server
app.listen(8080, () => console.log("Listening on port 8080"));
