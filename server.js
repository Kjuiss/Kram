const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const ROOT = __dirname;
const SETTINGS_PATH = path.join(ROOT, 'Settings.json');

// Body als JSON akzeptieren
app.use(express.json({ limit: '2mb' }));

// Statische Dateien (index.html, Settings.json, POs.json, PjMs.json, …)
app.use(express.static(ROOT));

app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

// Autosave-Endpunkt für das Dashboard
app.post('/settings', (req, res) => {
  fs.writeFile(SETTINGS_PATH, JSON.stringify(req.body, null, 2), 'utf8', err => {
    if (err) {
      console.error('Fehler beim Schreiben von Settings.json:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
    res.json({ ok: true });
  });
});

// Rollen-Templates aktualisieren (POs.json / PjMs.json / eigene Rollen)
app.post('/role/:roleKey', (req, res) => {
  const roleKey = req.params.roleKey;
  const safe = roleKey.replace(/[^a-z0-9_\-]/gi, '');
  if (!safe) {
    return res.status(400).json({ ok: false, error: 'Ungültiger Rollen-Key' });
  }
  const filePath = path.join(ROOT, safe + '.json');

  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8', err => {
    if (err) {
      console.error('Fehler beim Schreiben von', filePath, err);
      return res.status(500).json({ ok: false, error: err.message });
    }
    res.json({ ok: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Skill Matrix läuft auf http://localhost:${PORT}`);
});
