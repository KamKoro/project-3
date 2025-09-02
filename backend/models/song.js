const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  album: { type: String, trim: true },
  year: Number,
  duration: Number,        // optional (seconds, purely metadata)
  coverUrl: String
}, { timestamps: true });

// Add a text index so we can search by title/artist/album
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Song', songSchema);
