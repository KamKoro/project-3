const express = require('express');
const router = express.Router();
const Song = require('../models/song');

// GET /songs
// - optional q= search term (title/artist/album, case-insensitive)
// - optional source=catalog (kept for compatibility with your seeds; not required)
router.get('/', async (req, res, next) => {
  try {
    const { q, source } = req.query;
    const filter = {};

    if (source) filter.source = source; // only if your seed includes a 'source' field

    if (q && q.trim()) {
      const term = q.trim();
      filter.$or = [
        { title:  { $regex: term, $options: 'i' } },
        { artist: { $regex: term, $options: 'i' } },
        { album:  { $regex: term, $options: 'i' } },
      ];
    }

    const songs = await Song.find(filter).sort('title').limit(200);
    res.json(songs);
  } catch (err) { next(err); }
});

// GET /songs/:id
router.get('/', async (req, res) => {
  const { mine, q } = req.query;

  const filter = {};
  if (mine === 'true' && req.user) filter.createdBy = req.user._id;

  // Flexible search: use $text if index exists, else regex fallback
  if (q && q.trim()) {
    const term = q.trim();
    // Prefer text search
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { artist: { $regex: term, $options: 'i' } },
      { album: { $regex: term, $options: 'i' } },
    ];
  }

  const songs = await Song.find(filter).sort('-createdAt').limit(200); // cap results for speed
  res.json(songs);
});


// The catalogue is read-only from the API (seeded data).
// If you later re-enable user-created songs, add createdBy back to the model and
// implement auth/ownership checks. For now, return 405 for mutating routes.

router.post('/', (_req, res) => res.status(405).json({ message: 'Catalogue is read-only' }));
router.patch('/:id', (_req, res) => res.status(405).json({ message: 'Catalogue is read-only' }));
router.delete('/:id', (_req, res) => res.status(405).json({ message: 'Catalogue is read-only' }));

module.exports = router;
