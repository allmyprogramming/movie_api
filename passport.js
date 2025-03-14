const passport = require("passport");
const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models").User;

// Local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "username", // Username field for login
      passwordField: "password", // Password field for login
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ Username: username });
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        // Use the validatePassword method instead of direct comparison
        const isValid = await user.validatePassword(password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user); // Successful authentication
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT strategy
const jwtSecret = "your_jwt_secret"; // Ensure this matches the JWT secret used for signing tokens

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    },
    async (jwt_payload, done) => {
      try {
        // If you use 'Username' as the payload subject
        const user = await User.findOne({ Username: jwt_payload.Username });
        if (!user) {
          return done(null, false, { message: "Invalid token." });
        }
        return done(null, user); // User found
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Optional: You can remove these if you're only using JWT for stateless authentication
passport.serializeUser((user, done) => {
  done(null, user._id); // Store the user ID in the session (for session-based auth)
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
