const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Playlist = require('../models/playlist');
const Song = require('../models/song');
const verifyToken = require('../middleware/verify-token');

// helper: validate id
function ensureObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error('Invalid id');
    err.status = 400;
    throw err;
  }
}

// helper: allow http(s) urls or empty string
function isHttpUrl(v) {
  if (v === '' || v == null) return true;
  return /^https?:\/\/.+/i.test(String(v));
}

// helper: compute stats + shape response
function shapePlaylist(p) {
  const json = p.toJSON({ virtuals: false });
  const trackCount = (json.songs || []).length;
  const totalDuration = (json.songs || []).reduce((sum, s) => {
    const d = typeof s.duration === 'number' ? s.duration : 0;
    return sum + d;
  }, 0);
  return { ...json, trackCount, totalDuration };
}

// ---------- List current user's playlists ----------
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const lists = await Playlist.find({ owner: req.user._id })
      .populate({ path: 'songs', options: { sort: { title: 1 } } })
      .sort({ updatedAt: -1 })
      .lean(false);

    res.json(lists.map(shapePlaylist));
  } catch (err) { next(err); }
});

// ---------- Create ----------
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const coverUrl = req.body.coverUrl || '';
    if (!isHttpUrl(coverUrl)) return res.status(400).json({ message: 'coverUrl must be http(s) URL' });

    const doc = await Playlist.create({
      name: req.body.name,
      description: req.body.description,
      isPublic: !!req.body.isPublic,        // keep if your schema includes isPublic
      coverUrl,                             // <-- NEW
      owner: req.user._id,
      songs: [],
    });

    const populated = await doc.populate({ path: 'songs', options: { sort: { title: 1 } } });
    res.status(201).json(shapePlaylist(populated));
  } catch (err) { next(err); }
});

// ---------- Read one (owner only) ----------
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    ensureObjectId(req.params.id);
    const p = await Playlist.findById(req.params.id)
      .populate({ path: 'songs', options: { sort: { title: 1 } } });
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    if (p.owner.toString() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });
    res.json(shapePlaylist(p));
  } catch (err) { next(err); }
});

// ---------- Update meta (owner only) ----------
router.patch('/:id', verifyToken, async (req, res, next) => {
  try {
    ensureObjectId(req.params.id);
    const p = await Playlist.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    if (p.owner.toString() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });

    if (req.body.name != null) p.name = req.body.name;
    if (req.body.description != null) p.description = req.body.description;
    if (typeof req.body.isPublic === 'boolean') p.isPublic = req.body.isPublic;

    if (req.body.coverUrl !== undefined) {
      if (!isHttpUrl(req.body.coverUrl)) return res.status(400).json({ message: 'coverUrl must be http(s) URL' });
      p.coverUrl = req.body.coverUrl || '';
    }

    await p.save();
    await p.populate({ path: 'songs', options: { sort: { title: 1 } } });
    res.json(shapePlaylist(p));
  } catch (err) { next(err); }
});

// ---------- Update cover only (owner only) ----------
router.patch('/:id/cover', verifyToken, async (req, res, next) => {
  try {
    ensureObjectId(req.params.id);
    const p = await Playlist.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    if (p.owner.toString() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });

    const coverUrl = req.body.coverUrl || '';
    if (!isHttpUrl(coverUrl)) return res.status(400).json({ message: 'coverUrl must be http(s) URL' });
    p.coverUrl = coverUrl;

    await p.save();
    await p.populate({ path: 'songs', options: { sort: { title: 1 } } });
    res.json(shapePlaylist(p));
  } catch (err) { next(err); }
});

// ---------- Delete (owner only) ----------
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    ensureObjectId(req.params.id);
    const p = await Playlist.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    if (p.owner.toString() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });

    await p.deleteOne();
    res.status(204).end();
  } catch (err) { next(err); }
});

// ---------- Add song (owner only) ----------
router.post('/:id/songs', verifyToken, async (req, res, next) => {
  try {
    ensureObjectId(req.params.id);
    ensureObjectId(req.body.songId);

    const p = await Playlist.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    if (p.owner.toString() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });

    const s = await Song.findById(req.body.songId);
    if (!s) return res.status(400).json({ message: 'Invalid songId' });

    if (!p.songs.some(id => id.toString() === req.body.songId)) {
      p.songs.push(req.body.songId);
      await p.save();
    }
    await p.populate({ path: 'songs', options: { sort: { title: 1 } } });
    res.json(shapePlaylist(p));
  } catch (err) { next(err); }
});

// ---------- Remove song (owner only) ----------
router.delete('/:id/songs/:songId', verifyToken, async (req, res, next) => {
  try {
    ensureObjectId(req.params.id);
    ensureObjectId(req.params.songId);

    const p = await Playlist.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    if (p.owner.toString() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });

    p.songs = p.songs.filter(t => t.toString() !== req.params.songId);
    await p.save();
    await p.populate({ path: 'songs', options: { sort: { title: 1 } } });
    res.json(shapePlaylist(p));
  } catch (err) { next(err); }
});

module.exports = router;
