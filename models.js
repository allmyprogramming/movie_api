const mongoose = require("mongoose");

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
let userSchema = mongoose.Schema({
    Username: { type: String, required: true, unique: true },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    FavoriteMovie: [{ type: String }],  // Store movie titles as strings
    Birthday: { type: Date },
});

// Create models
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

// Export models
module.exports.Movie = Movie;
module.exports.User = User;
