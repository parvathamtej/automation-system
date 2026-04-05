require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { workflowCatalog, scenarios } = require('./src/data/workflows');
const { processWorkflow } = require('./workflow-runner');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_DIST_DIR = path.join(__dirname, 'client', 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());

app.get('/api/workflows', (req, res) => {
  res.json({ workflows: workflowCatalog });
});

app.get('/api/scenarios', (req, res) => {
  res.json({ scenarios });
});

app.post('/api/simulate', async (req, res) => {
  try {
    const result = await processWorkflow(req.body);
    res.json(result);
  } catch (err) {
    console.error('Execution error:', err.message);
    res.status(500).json({ error: err.message || 'Execution failed' });
  }
});

const staticDir = fs.existsSync(path.join(CLIENT_DIST_DIR, 'index.html'))
  ? CLIENT_DIST_DIR
  : PUBLIC_DIR;

app.use(express.static(staticDir));

app.get(/(.*)/, (req, res) => {
  const indexPath = path.join(staticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
    return;
  }

  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`AI Workflow server running on http://localhost:${PORT}`);
});
