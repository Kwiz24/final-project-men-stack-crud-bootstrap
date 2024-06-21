const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const dotenv = require('dotenv');
const Album = require('./models/album'); // Adjust the path to your Album model

dotenv.config();

// Passport Config
require('./config/passport')(passport);

const app = express();
const PORT = process.env.PORT || 3003;

// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.set('view engine', 'ejs'); // Set the view engine to EJS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI; // Make sure you have this environment variable set
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Root route handler - redirect to /albums
app.get('/', (req, res) => {
  res.redirect('/albums');
});

// Index route - show all albums
app.get('/albums', async (req, res) => {
  try {
    const albums = await Album.find();
    console.log('Fetched albums:', albums); // Debugging line
    res.render('albums/index', { albums, user: req.user });
  } catch (err) {
    console.error('Error fetching albums:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Search route - handle search queries
app.get('/albums/search', async (req, res) => {
  try {
    const query = req.query.q; // Get the search query from the request query parameters
    const albums = await Album.find({
      $or: [
        { albumName: { $regex: query, $options: 'i' } }, // Case-insensitive search by albumName
        { artist: { $regex: query, $options: 'i' } }, // Case-insensitive search by artist
        { genre: { $regex: query, $options: 'i' } }, // Case-insensitive search by genre
      ],
    });

    res.render('albums/index', { albums, query, user: req.user }); // Render the index view with search results
  } catch (err) {
    console.error('Error searching albums:', err);
    res.status(500).render('error', { message: 'Internal Server Error', error: err });
  }
});

// New route - show form to create new album
app.get('/albums/new', (req, res) => {
  res.render('albums/new', { user: req.user });
});

// Create route - add new album to database
app.post('/albums', async (req, res) => {
  try {
    console.log('Received album data:', req.body); // Debugging: check incoming data
    const newAlbum = new Album(req.body.album);
    await newAlbum.save();
    res.redirect('/albums');
  } catch (err) {
    console.error('Error creating album:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Show route - show details of a specific album
app.get('/albums/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      res.status(404).send('Album not found');
      return;
    }
    res.render('albums/show', { album, user: req.user });
  } catch (err) {
    console.error('Error fetching album:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Edit route - show form to edit a specific album
app.get('/albums/:id/edit', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      res.status(404).send('Album not found');
      return;
    }
    res.render('albums/edit', { album, user: req.user });
  } catch (err) {
    console.error('Error fetching album for edit:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Update route - update a specific album in the database
app.put('/albums/:id', async (req, res) => {
  try {
    await Album.findByIdAndUpdate(req.params.id, req.body.album);
    res.redirect(`/albums/${req.params.id}`);
  } catch (err) {
    console.error('Error updating album:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Delete route - delete a specific album from the database
app.delete('/albums/:id', async (req, res) => {
  try {
    await Album.findByIdAndDelete(req.params.id);
    res.redirect('/albums');
  } catch (err) {
    console.error('Error deleting album:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Entertainment routes

// Music route - show music content
app.get('/music', (req, res) => {
  res.render('entertainment/music', { user: req.user });
});

// Videos route - show video content
app.get('/videos', (req, res) => {
  res.render('entertainment/videos', { user: req.user });
});

// Genres route - show genres content
app.get('/genres', (req, res) => {
  res.render('entertainment/genres', { user: req.user });
});

// Register route - show registration form
app.get('/users/register', (req, res) => {
  res.render('users/register', { user: req.user });
});

// Register route - handle registration
app.post('/users/register', async (req, res) => {
  // Handle user registration logic here
});

// Login route - show login form
app.get('/users/login', (req, res) => {
  res.render('users/login', { user: req.user });
});

// Login route - handle login
app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/albums',
  failureRedirect: '/users/login',
  failureFlash: true
}));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
