// Import necessary modules
const express = require('express');
const morgan = require('morgan');

// Initialize Express
const app = express();

// Use Morgan middleware for logging requests
app.use(morgan('common'));

// Serve static files (like documentation.html) from the "public" folder
app.use(express.static('public'));

// Route for the "/movies" endpoint
app.get('/movies', (req, res) => {
  const topMovies = [
    { title: 'Inception', year: 2010 },
    { title: 'The Dark Knight', year: 2008 },
    { title: 'Interstellar', year: 2014 },
    { title: 'The Matrix', year: 1999 },
    { title: 'Pulp Fiction', year: 1994 },
    { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
    { title: 'The Godfather', year: 1972 },
    { title: 'Forrest Gump', year: 1994 },
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'Fight Club', year: 1999 },
  ];
  res.json(topMovies); // Send the movies as JSON
});

// Route for the "/" endpoint
app.get('/', (req, res) => {
  res.send('Welcome to my Book Club!');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
