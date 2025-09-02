// seeds/seedCatalogSongs.js
// Run: node seeds/seedCatalogSongs.js
require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../models/song');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hoot_music_app';

/* --------------------------------- Helpers --------------------------------- */
function parseDurationToSeconds(val) {
  if (val == null) return null;
  if (typeof val === 'number' && Number.isFinite(val)) return Math.floor(val);
  if (typeof val !== 'string') return null;

  const s = val.trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);

  const parts = s.split(':').map(p => p.trim());
  if (parts.length === 2) {
    const [m, sec] = parts.map(Number);
    if (Number.isFinite(m) && Number.isFinite(sec)) return m * 60 + sec;
  } else if (parts.length === 3) {
    const [h, m, sec] = parts.map(Number);
    if ([h, m, sec].every(Number.isFinite)) return h * 3600 + m * 60 + sec;
  }
  return null;
}

function makeKey(s) {
  return `${(s.artist || '').toLowerCase()}::${(s.title || '').toLowerCase()}`;
}

/* ------------------------------ Catalog (LOCAL COVERS ONLY) ------------------------------ */
/* Place files in: frontend/public/covers/<filename>, served at /covers/<filename> */

const CATALOG = [
  // =========================
  // Dave — Psychodrama (2019)
  // =========================
  { title: 'Psycho', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Streatham', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Black', artist: 'Dave', album: 'Psychodrama', duration: '3:53', genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' }, // you had this
  { title: 'Purple Heart', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Location (feat. Burna Boy)', artist: 'Dave', album: 'Psychodrama', duration: '4:02', genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' }, // you had this
  { title: 'Disaster (feat. J Hus)', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Screwface Capital', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Environment', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Lesley (feat. Ruelle)', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Voices', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },
  { title: 'Drama', artist: 'Dave', album: 'Psychodrama', duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-psychodrama.jpeg' },

  // ==========================================
  // Dave — We’re All Alone in This Together (2021)
  // ==========================================
  { title: "We're All Alone", artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'Verdansk', artist: 'Dave', album: "We're All Alone in This Together", duration: '3:03', genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' }, // you had this
  { title: 'Clash (feat. Stormzy)', artist: 'Dave', album: "We're All Alone in This Together", duration: '3:12', genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' }, // you had this
  { title: 'In the Fire', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'Three Rivers', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'System (feat. Wizkid)', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'Lazarus (feat. BOJ)', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'Law of Attraction (feat. Snoh Aalegra)', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'Both Sides of a Smile (feat. James Blake)', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'Twenty to One', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: 'Heart Attack', artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },
  { title: "Survivor's Guilt", artist: 'Dave', album: "We're All Alone in This Together", duration: null, genre: 'Hip Hop', coverUrl: '/covers/dave-we-re-all-alone-in-this-together.jpg' },

  // ==========================
  // Stormzy — Heavy Is the Head
  // ==========================
  { title: 'Big Michael', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Audacity (feat. Headie One)', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Crown', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: "Rachael's Little Brother (Interlude)", artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Own It (feat. Ed Sheeran & Burna Boy)', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Pop Boy (feat. Aitch)', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'One Second (feat. H.E.R.)', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Wiley Flow', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Bronze', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Superheroes', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Lessons', artist: 'Stormzy', album: 'Heavy Is the Head', duration: null, genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' },
  { title: 'Vossi Bop', artist: 'Stormzy', album: 'Heavy Is the Head', duration: '3:16', genre: 'Hip Hop', coverUrl: '/covers/stormzy-heavy-is-the-head.png' }, // you had this

  // =================================
  // J. Cole — 2014 Forest Hills Drive
  // =================================
  { title: 'Intro', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'January 28th', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'Wet Dreamz', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: '3:59', genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' }, // you had this
  { title: "03' Adolescence", artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'A Tale of 2 Citiez', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'Fire Squad', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'St. Tropez', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'G.O.M.D.', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'No Role Modelz', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: '4:52', genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' }, // you had this
  { title: 'Hello', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'Apparently', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'Love Yourz', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },
  { title: 'Note to Self', artist: 'J. Cole', album: '2014 Forest Hills Drive', duration: null, genre: 'Hip Hop', coverUrl: '/covers/j-cole-2014-forest-hills-drive.jpg' },

  // ========================
  // Mac Miller — Swimming
  // ========================
  { title: 'Come Back to Earth', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Hurt Feelings', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: "What's the Use?", artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Perfecto', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Self Care', artist: 'Mac Miller', album: 'Swimming', duration: '5:45', genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' }, // you had this
  { title: 'Wings', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Ladders', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hip', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Small Worlds', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Conversation Pt. 1', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Dunno', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'Jet Fuel', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: '2009', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },
  { title: 'So It Goes', artist: 'Mac Miller', album: 'Swimming', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-swimming.jpg' },

  // ========================
  // Mac Miller — Circles
  // ========================
  { title: 'Circles', artist: 'Mac Miller', album: 'Circles', duration: '5:42', genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' }, // you had this
  { title: 'Complicated', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'Blue World', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'Good News', artist: 'Mac Miller', album: 'Circles', duration: '5:42', genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' }, // you had this (kept)
  { title: 'I Can See', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'Everybody', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'Woods', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'Hand Me Downs', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'That’s on Me', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'Surf', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },
  { title: 'Once a Day', artist: 'Mac Miller', album: 'Circles', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-circles.png' },

  // =================================
  // Mac Miller — The Divine Feminine 
  // =================================
  { title: 'Dang! (feat. Anderson .Paak)', artist: 'Mac Miller', album: 'The Divine Feminine', duration: '5:05', genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'Congratulations (feat. Bilal)', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'Stay', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'Skin', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'Cinderella (feat. Ty Dolla $ign)', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'Planet God Damn (feat. Njomza)', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'Soulmate', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'We (feat. CeeLo Green)', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'My Favorite Part (feat. Ariana Grande)', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },
  { title: 'God Is Fair, Sexy Nasty (feat. Kendrick Lamar)', artist: 'Mac Miller', album: 'The Divine Feminine', duration: null, genre: 'Hip Hop', coverUrl: '/covers/mac-miller-the-divine-feminine.png' },

  // ==================================
  // Childish Gambino — Because the Internet
  // ==================================
  { title: 'Crawl', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'WORLDSTAR', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Dial Up', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'The Worst Guys (feat. Chance the Rapper)', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Shadows', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Telegraph Ave ("Oakland" by Lloyd)', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Sweatpants', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: '3005', artist: 'Childish Gambino', album: 'Because the Internet', duration: '3:54', genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' }, // you had this
  { title: 'Playing Around Before the Party Starts', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'The Party', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'No Exit', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Death by Numbers', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Flight of the Navigator', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Zealots of Stockholm [Free Information]', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Urn', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Pink Toes (feat. Jhené Aiko)', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Earth: The Oldest Computer (The Last Night) [feat. Azealia Banks]', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },
  { title: 'Life: The Biggest Troll [Andrew Auernheimer]', artist: 'Childish Gambino', album: 'Because the Internet', duration: null, genre: 'Hip Hop', coverUrl: '/covers/childish-gambino-because-the-internet.jpeg' },

// =================
// Gallant — Ology
// =================
{ title: 'First', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Talking to Myself', artist: 'Gallant', album: 'Ology', duration: '3:24', genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Shotgun', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Bourbon', artist: 'Gallant', album: 'Ology', duration: '3:24', genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Bone + Tissue', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Oh, Universe', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Weight in Gold', artist: 'Gallant', album: 'Ology', duration: '3:23', genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Episode', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Miyazaki', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Counting', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Percogesic', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Jupiter', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Open Up', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Skipping Stones (feat. Jhené Aiko)', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Chandra', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },
{ title: 'Last', artist: 'Gallant', album: 'Ology', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-ology.jpg' },

// ============================
// Gallant — Sweet Insomnia
// ============================
{ title: '410 (Intro)', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Sharpest Edges', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Crimes', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Paper Tulips', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Forever 21', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Sweet Insomnia (feat. 6LACK)', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Hurt', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Hips', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Panasonic', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Compromise (feat. Sabrina Claudio)', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Sleep On It', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Konami', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },
{ title: 'Céline', artist: 'Gallant', album: 'Sweet Insomnia', duration: null, genre: 'R&B', coverUrl: '/covers/gallant-sweet-insomnia.jpeg' },

  // =========================
  // Green Day — American Idiot
  // =========================
  { title: 'American Idiot', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Jesus of Suburbia', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Holiday', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Boulevard of Broken Dreams', artist: 'Green Day', album: 'American Idiot', duration: '4:20', genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' }, // you had this
  { title: 'Are We the Waiting', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'St. Jimmy', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Give Me Novacaine', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: "She's a Rebel", artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Extraordinary Girl', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Letterbomb', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Wake Me Up When September Ends', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Homecoming', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },
  { title: 'Whatsername', artist: 'Green Day', album: 'American Idiot', duration: null, genre: 'Rock', coverUrl: '/covers/green-day-american-idiot.png' },

  // ==========================
  // Linkin Park — Hybrid Theory
  // ==========================
  { title: 'Papercut', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'One Step Closer', artist: 'Linkin Park', album: 'Hybrid Theory', duration: '2:35', genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' }, // you had this
  { title: 'With You', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'Points of Authority', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'Crawling', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'Runaway', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'By Myself', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'In the End', artist: 'Linkin Park', album: 'Hybrid Theory', duration: '3:36', genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' }, // you had this
  { title: 'A Place for My Head', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'Forgotten', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'Cure for the Itch', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },
  { title: 'Pushing Me Away', artist: 'Linkin Park', album: 'Hybrid Theory', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-hybrid-theory.jpg' },

  // ======================
  // Linkin Park — Meteora
  // ======================
  { title: 'Foreword', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: "Don't Stay", artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'Somewhere I Belong', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'Lying from You', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'Hit the Floor', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'Easier to Run', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'Faint', artist: 'Linkin Park', album: 'Meteora', duration: '2:42', genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' }, // you had this
  { title: 'Figure.09', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'Breaking the Habit', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'From the Inside', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },
  { title: 'Numb', artist: 'Linkin Park', album: 'Meteora', duration: '3:07', genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' }, // you had this
  { title: 'Session', artist: 'Linkin Park', album: 'Meteora', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-meteora.jpg' },

  // ================================
  // Linkin Park — Minutes to Midnight
  // ================================
  { title: 'Wake', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'Given Up', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'Leave Out All the Rest', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'Bleed It Out', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: "Shadow of the Day", artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'What I’ve Done', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: '3:25', genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' }, // you had this
  { title: 'Hands Held High', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'No More Sorrow', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'Valentine’s Day', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'In Between', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'In Pieces', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },
  { title: 'The Little Things Give You Away', artist: 'Linkin Park', album: 'Minutes to Midnight', duration: null, genre: 'Rock', coverUrl: '/covers/linkin-park-minutes-to-midnight.jpg' },

  // ==========================================
  // Fall Out Boy — From Under the Cork Tree
  // ==========================================
  { title: "Our Lawyer Made Us Change the Name of This Song So We Wouldn't Get Sued", artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'Of All the Gin Joints in All the World', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: "Dance, Dance", artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: '3:00', genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' }, // you had this
  { title: 'Sugar, We\'re Goin Down', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: '3:49', genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' }, // you had this
  { title: 'Nobody Puts Baby in the Corner', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'I\'ve Got a Dark Alley and a Bad Idea...', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: '7 Minutes in Heaven (Atavan Halen)', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'Sophomore Slump or Comeback of the Year', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'Champagne for My Real Friends, Real Pain...', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'I Slept With Someone in Fall Out Boy...', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'A Little Less Sixteen Candles, a Little More "Touch Me"', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'Get Busy Living or Get Busy Dying', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },
  { title: 'XO', artist: 'Fall Out Boy', album: 'From Under the Cork Tree', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-from-under-the-cork-tree.jpg' },

  // ====================================
  // Fall Out Boy — Infinity on High
  // ====================================
  { title: 'Thriller', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'The Take Over, the Breaks Over', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'This Ain’t a Scene, It’s an Arms Race', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'I’m Like a Lawyer with the Way I’m Always Trying to Get You Off (Me & You)', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'Hum Hallelujah', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'Golden', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'Thnks fr th Mmrs', artist: 'Fall Out Boy', album: 'Infinity on High', duration: '3:23', genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' }, // you had this
  { title: 'The (After) Life of the Party', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'The Carpal Tunnel of Love', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'Bang the Doldrums', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'Fame < Infamy', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: 'You’re Crashing, But You’re No Wave', artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },
  { title: "I've Got All This Ringing in My Ears...", artist: 'Fall Out Boy', album: 'Infinity on High', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-infinity-on-high.jpg' },

  // ===============================================
  // Fall Out Boy — American Beauty/American Psycho
  // ===============================================
  { title: 'Irresistible', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'American Beauty/American Psycho', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Centuries', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: '3:48', genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' }, // you had this
  { title: 'The Kids Aren’t Alright', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Uma Thurman', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Jet Pack Blues', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Novocaine', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Fourth of July', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Favorite Record', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Immortals', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },
  { title: 'Twin Skeleton’s (Hotel in NYC)', artist: 'Fall Out Boy', album: 'American Beauty/American Psycho', duration: null, genre: 'Rock', coverUrl: '/covers/fall-out-boy-american-beauty-american-psycho.png' },

  // =============================================
  // Panic! at the Disco — A Fever You Can’t Sweat Out
  // =============================================
  { title: 'Introduction', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'The Only Difference Between Martyrdom and Suicide Is Press Coverage', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'London Beckoned Songs About Money Written by Machines', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'Nails for Breakfast, Tacks for Snacks', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'Camisado', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'Time to Dance', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'Lying Is the Most Fun a Girl Can Have Without Taking Her Clothes Off', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'Intermission', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'But It’s Better If You Do', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'I Write Sins Not Tragedies', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: '3:06', genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' }, // you had this
  { title: 'I Constantly Thank God for Esteban', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'There’s a Good Reason These Tables Are Numbered Honey, You Just Haven’t Thought of It Yet', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },
  { title: 'Build God, Then We’ll Talk', artist: 'Panic! at the Disco', album: "A Fever You Can't Sweat Out", duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-a-fever-you-can-t-sweat-out.jpeg' },

  // ======================================
  // Panic! at the Disco — Death of a Bachelor
  // ======================================
  { title: 'Victorious', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'Don’t Threaten Me with a Good Time', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'Hallelujah', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'Emperor’s New Clothes', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'Death of a Bachelor', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: '3:23', genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' }, // you had this
  { title: 'Crazy=Genius', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'LA Devotee', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'Golden Days', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'The Good, the Bad and the Dirty', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'House of Memories', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },
  { title: 'Impossible Year', artist: 'Panic! at the Disco', album: 'Death of a Bachelor', duration: null, genre: 'Rock', coverUrl: '/covers/panic-at-the-disco-death-of-a-bachelor.png' },

  // ===========================
  // Queen — A Night at the Opera
  // ===========================
  { title: 'Death on Two Legs (Dedicated to...)', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'Lazing on a Sunday Afternoon', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'I’m in Love with My Car', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'You’re My Best Friend', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: "'39", artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'Sweet Lady', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'Seaside Rendezvous', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'The Prophet’s Song', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'Love of My Life', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'Good Company', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },
  { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' }, // you had this
  { title: 'God Save the Queen', artist: 'Queen', album: 'A Night at the Opera', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-night-at-the-opera.jpeg' },

  // ===============================
  // Queen — A Day at the Races
  // ===============================
  { title: 'Tie Your Mother Down', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'You Take My Breath Away', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'Long Away', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'The Millionaire Waltz', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'You and I', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'Somebody to Love', artist: 'Queen', album: 'A Day at the Races', duration: '4:56', genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' }, // you had this
  { title: 'White Man', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'Good Old-Fashioned Lover Boy', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'Drowse', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },
  { title: 'Teo Torriatte (Let Us Cling Together)', artist: 'Queen', album: 'A Day at the Races', duration: null, genre: 'Rock', coverUrl: '/covers/queen-a-day-at-the-races.jpeg' },

];


/* ----------------------------------- Run ----------------------------------- */
(async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1) One-off migration: convert string durations → Number (seconds)
    const candidates = await Song.find(
      { duration: { $type: 'string' } },
      { _id: 1, artist: 1, title: 1, duration: 1 }
    );

    let migrated = 0;
    for (const doc of candidates) {
      const seconds = parseDurationToSeconds(doc.duration);
      if (typeof seconds === 'number' && Number.isFinite(seconds)) {
        await Song.updateOne({ _id: doc._id }, { $set: { duration: seconds } });
        migrated += 1;
      }
    }
    if (candidates.length) {
      console.log(`Duration migration: scanned ${candidates.length}, converted ${migrated}.`);
    } else {
      console.log('Duration migration: no string durations found.');
    }

    // 2) Seed catalog with artist+title duplicate protection
    const existingByTitle = await Song.find({
      $or: [{ source: 'catalog' }, { source: { $exists: false } }],
      title: { $in: CATALOG.map(s => s.title) }
    }).select('artist title');

    const existingKeySet = new Set(existingByTitle.map(makeKey));

    const prepared = CATALOG.map(s => ({
      ...s,
      duration: parseDurationToSeconds(s.duration),
      source: 'catalog'
    }));

    const bad = prepared.filter(s => typeof s.duration !== 'number' || !Number.isFinite(s.duration));
    if (bad.length) {
      console.warn('Warning: some durations could not be parsed:', bad.map(b => `${b.artist} - ${b.title}`));
    }

    const toInsert = prepared.filter(s => !existingKeySet.has(makeKey(s)));

    if (toInsert.length) {
      await Song.insertMany(toInsert);
      console.log(`Inserted ${toInsert.length} catalog songs`);
    } else {
      console.log('Catalog songs already present (by artist+title).');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
})();