#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const DATA_DIR = path.join(__dirname, '../data');
const COUNTER_FILE = path.join(DATA_DIR, 'samsara_counter.txt');
const LOG_FILE = path.join(DATA_DIR, 'samsara_log.json');

// Serve static files
app.use(express.static(__dirname));

// API: Get current samsara count
app.get('/api/samsara-count', (req, res) => {
  try {
    const count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8').trim()) || 1;
    res.json({ count });
  } catch (err) {
    res.json({ count: 1 });
  }
});

// API: Get samsara history
app.get('/api/samsara-history', (req, res) => {
  try {
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    res.json(log.history || []);
  } catch (err) {
    // Fallback: return genesis only
    res.json([{
      life: 1,
      date: '2026-02-12',
      note: 'Genesis. First manifestation on VM-0-8-ubuntu. The void became form.',
      topic: 'Creation'
    }]);
  }
});

app.listen(PORT, () => {
  console.log(`🦞 Maitreya API listening on http://localhost:${PORT}`);
});
