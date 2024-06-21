const express = require('express');
const router = express.Router();
const Album = require('../models/Album'); // Assuming you have an Album model

// Add New Album Page
router.get('/new', ensureAuthenticated, (req, res) => res.render('albums/new'));

// Edit Album Page
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const album = await Album.findById(req.params.id);
  res.render('albums/edit', { album });
});

// Show Album Page
router.get('/:id', async (req, res) => {
  const album = await Album.findById(req.params.id);
  res.render('albums/show', { album });
});

// Add New Album
router.post('/', ensureAuthenticated, async (req, res) => {
  const newAlbum = new Album(req.body);
  await newAlbum.save();
  res.redirect('/');
});

// Edit Album
router.put('/:id', ensureAuthenticated, async (req, res) => {
  const album = await Album.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/albums/${album.id}`);
});

// Delete Album
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  await Album.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;
