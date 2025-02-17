const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the Movie schema
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
    BirthYear: Number,
  },
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

// Static method for hashing passwords
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hashSync(password, 10); // Hash password with salt rounds
};

// Instance method for validating passwords
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password); // Compare password with stored hash
};

// Create models
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

// Export models
module.exports.Movie = Movie;
module.exports.User = User;
