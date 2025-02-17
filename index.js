const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const Models = require("./models.js");
const { check, validationResult } = require('express-validator');

const app = express();
const Movie = Models.Movie;
const User = Models.User;

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

// Database Connection
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

// Passport setup
const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new LocalStrategy(
    {
      usernameField: "username", // Set username field for local strategy
      passwordField: "password", // Set password field for local strategy
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ Username: username });
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        // No password hashing, just comparing plain text
        if (user.Password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user); // Successful authentication
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id); // Store the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// JWT Secret Key
const jwtSecret = "your_jwt_secret"; // JWT secret key

// Generate JWT token function
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/* POST login - To get the JWT token */
app.post("/login", [
  check('username').isLength({ min: 1 }).withMessage('Username is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(400).json({
        message: "Something is not right",
        user: user,
      });
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        return res.send(error);
      }
      let token = generateJWTToken(user.toJSON());
      return res.json({ user, token });
    });
  })(req, res, next); // Ensure next is passed here
});

/* POST Register a new user */
app.post("/users", [
  check('username').isLength({ min: 1 }).withMessage('Username is required'),
  check('email').isEmail().withMessage('Please provide a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const { username, email, password, favoriteMovies, birthday } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await User.findOne({ Username: username });
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    // Hash the password before saving
    const hashedPassword = await User.hashPassword(password);

    const newUser = new User({
      Username: username,
      Email: email,
      Password: hashedPassword, // Store the hashed password
      FavoriteMovie: favoriteMovies || [],
      Birthday: birthday ? new Date(birthday) : null, // Handle optional birthday
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      user: {
        Username: newUser.Username,
        Email: newUser.Email,
        FavoriteMovie: newUser.FavoriteMovie,
        Birthday: newUser.Birthday,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract the token from the Authorization header
      secretOrKey: jwtSecret, // Secret to verify the token
    },
    async (jwt_payload, done) => {
      try {
        // Look up the user based on the JWT payload's subject (which should be the Username)
        const user = await User.findOne({ Username: jwt_payload.Username });
        if (user) {
          return done(null, user); // User found
        } else {
          return done(null, false); // User not found
        }
      } catch (err) {
        return done(err, false); // Error in authentication
      }
    }
  )
);
// ********** USER ROUTES **********

// Get all users (Protected)
app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by username (Protected)
app.get("/users/:username", passport.authenticate("jwt", { session: false }), async (req, res) => {
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

// Get user favorites by username (No ObjectIds, just movie titles)
app.get("/users/:username/favorites", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ Username: req.params.username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Return the list of movie titles
    return res.status(200).json(user.FavoriteMovie);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ********** MOVIE ROUTES (All Protected with JWT) **********

// Get all movies (Protected)
app.get("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get movie by title (Protected)
app.get("/movies/:title", passport.authenticate("jwt", { session: false }), async (req, res) => {
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

// Get movies by genre (Protected)
app.get("/movies/genre/:genreName", [
  check('genreName').isLength({ min: 1 }).withMessage('Genre name is required')
], passport.authenticate("jwt", { session: false }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const movies = await Movie.find({ "Genre.Name": req.params.genreName });
    if (movies.length > 0) {
      res.status(200).json(movies);
    } else {
      res.status(404).send(`No movies found for genre: ${req.params.genreName}`);
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching movies by director" });
  }
});


// Start server
app.listen(8080, () => console.log("Listening on port 8080"));
