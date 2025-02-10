const mongoose = require('mongoose');

// Define the Movie schema with the specified fields
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
        birthYear: Number // Added birthYear for the director
    },
    Actors: [String],
    ImageUrl: String, // Changed ImagePath to ImageUrl
    Featured: Boolean
});

// Define the User schema with the specified fields
let userSchema = mongoose.Schema({
  Name: { type: String },  // Name of the user (no longer required)
  Email: { type: String },  // Email address of the user (no longer required)
  FavoriteMovie: { type: String },  // Movie that the user likes
  Birthday: { type: Date },  // User's birthday
  IsActive: { type: Boolean, default: true },  // Whether the user is active or not
});

// Create models from the schemas
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export the models so that they can be used in other files
module.exports.Movie = Movie;
module.exports.User = User;
