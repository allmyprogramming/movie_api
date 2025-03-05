const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the Movie schema
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: String,
  Director: String,
  Actors: [String],
  ImageUrl: String,
  Featured: Boolean,
});

// User schema with static method for password hashing
let userSchema = mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  FavoriteMovie: [{ type: String }], // Store movie titles as strings
  Birthday: { type: Date },
});

// Static method for hashing passwords (async)
userSchema.statics.hashPassword = async function(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds); // Async version of bcrypt hashing
  return hashedPassword;
};

// Instance method for validating passwords (async)
userSchema.methods.validatePassword = async function(password) {
  const isMatch = await bcrypt.compare(password, this.Password); // Async version of bcrypt comparison
  return isMatch;
};

// Create models
let Movie = mongoose.model("Movie", movieSchema, "movies"); // Explicitly set collection name
let User = mongoose.model("User", userSchema, "users"); // Explicitly set collection name

// Export models
module.exports.Movie = Movie;
module.exports.User = User;
