const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],

    // optional: make a playlist public or private
    isPublic: { type: Boolean, default: false },

    // optional cover image URL
    coverUrl: {
      type: String,
      default: '',
      validate: {
        validator: v => v === '' || /^https?:\/\/.+/i.test(v),
        message: 'coverUrl must be an http(s) URL',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
