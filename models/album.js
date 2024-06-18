const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  albumName: { type: String, required: true },
  artist: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
  albumImageUrl: { type: String, required: true },
  artistImageUrl: { type: String, required: true }
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
