require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { workflowCatalog, scenarios } = require('./src/data/workflows');
const { processWorkflow } = require('./workflow-runner');
const { analyzeIncident, raiseIncidentTicket } = require('./src/services/incident-triage');
const { generateLearningPath, confirmLearningPath, emailLearningPlanToUser } = require('./src/services/learning-path');
const {
  analyzeTaskAssignment,
  confirmTaskAssignment,
  emailTaskReportToDevTeam,
} = require('./src/services/task-assignment');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
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

app.post('/api/incident-triage/analyze', async (req, res) => {
  try {
    const analysis = await analyzeIncident(req.body?.inputs ? req.body.inputs : req.body);
    res.json(analysis);
  } catch (err) {
    console.error('Incident triage error:', err.message);
    res.status(400).json({ error: err.message || 'Incident triage failed' });
  }
});

app.post('/api/incident-triage/raise-ticket', async (req, res) => {
  try {
    const inputs = req.body?.inputs || req.body || {};
    const analysis = req.body?.analysis || req.body?.triage || {};

    if (!inputs.whatWentWrong) {
      res.status(400).json({ error: 'Missing required inputs.whatWentWrong' });
      return;
    }

    if (!analysis.summary || !analysis.root_cause || !analysis.suggested_action) {
      res.status(400).json({ error: 'Missing required analysis fields' });
      return;
    }

    const ticket = await raiseIncidentTicket({ inputs, analysis });
    res.json({
      success: true,
      ticket,
      message:
        'Your ticket has been raised and sent to the dev team. It will be resolved ASAP—thanks for your patience.',
    });
  } catch (err) {
    console.error('Raise ticket error:', err.message);
    res.status(500).json({ error: err.message || 'Could not raise ticket' });
  }
});

app.post('/api/learning-path/analyze', async (req, res) => {
  try {
    const plan = await generateLearningPath(req.body);
    res.json(plan);
  } catch (err) {
    console.error('Learning path error:', err.message);
    res.status(400).json({ error: err.message || 'Learning path failed' });
  }
});

app.post('/api/learning-path/confirm', async (req, res) => {
  try {
    const inputs = req.body?.inputs || {};
    const plan = req.body?.plan || {};

    if (!inputs.topic && !inputs.goal) {
      res.status(400).json({ error: 'Missing required inputs.topic' });
      return;
    }

    if (!plan.summary || (!Array.isArray(plan.days) && !Array.isArray(plan.weeks))) {
      res.status(400).json({ error: 'Missing required plan fields' });
      return;
    }

    const confirmation = await confirmLearningPath({ inputs, plan });
    res.json({
      success: true,
      confirmation,
      message: 'Your learning path has been saved.',
    });
  } catch (err) {
    console.error('Confirm learning path error:', err.message);
    res.status(500).json({ error: err.message || 'Could not confirm learning path' });
  }
});

app.post('/api/learning-path/email-plan', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim();
    const inputs = req.body?.inputs || {};
    const plan = req.body?.plan || {};

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Missing or invalid email' });
      return;
    }

    if (!inputs.topic && !inputs.goal) {
      res.status(400).json({ error: 'Missing required inputs.topic' });
      return;
    }

    if (!plan.summary || (!Array.isArray(plan.days) && !Array.isArray(plan.weeks))) {
      res.status(400).json({ error: 'Missing required plan fields' });
      return;
    }

    const ticket = await emailLearningPlanToUser({ email, inputs, plan });
    res.json({
      success: true,
      ticket,
      message: 'Plan sent to your email.',
    });
  } catch (err) {
    console.error('Email learning plan error:', err.message);
    res.status(500).json({ error: err.message || 'Could not email plan' });
  }
});

app.post('/api/task-assignment/analyze', async (req, res) => {
  try {
    const analysis = await analyzeTaskAssignment(req.body);
    res.json(analysis);
  } catch (err) {
    console.error('Task assignment error:', err.message);
    res.status(400).json({ error: err.message || 'Task assignment failed' });
  }
});

app.post('/api/task-assignment/confirm', async (req, res) => {
  try {
    const inputs = req.body?.inputs || {};
    const analysis = req.body?.analysis || {};

    if (!inputs.taskDescription) {
      res.status(400).json({ error: 'Missing required inputs.taskDescription' });
      return;
    }

    if (!Array.isArray(inputs.teamMembers) || !inputs.teamMembers.length) {
      res.status(400).json({ error: 'Missing required inputs.teamMembers' });
      return;
    }

    if (!analysis.summary || !Array.isArray(analysis.assignments)) {
      res.status(400).json({ error: 'Missing required analysis fields' });
      return;
    }

    const confirmation = await confirmTaskAssignment({ inputs, analysis });
    res.json({
      success: true,
      confirmation,
      message: 'Assignments created and emailed to the team.',
    });
  } catch (err) {
    console.error('Confirm task assignment error:', err.message);
    res.status(500).json({ error: err.message || 'Could not confirm task assignment' });
  }
});

app.post('/api/task-assignment/email-dev-report', async (req, res) => {
  try {
    const inputs = req.body?.inputs || {};
    const analysis = req.body?.analysis || {};

    if (!inputs.taskDescription) {
      res.status(400).json({ error: 'Missing required inputs.taskDescription' });
      return;
    }

    if (!analysis.summary || !Array.isArray(analysis.assignments) || !analysis.assignments.length) {
      res.status(400).json({ error: 'Missing required analysis.assignments' });
      return;
    }

    const ticket = await emailTaskReportToDevTeam({ inputs, analysis });
    res.json({
      success: true,
      ticket,
      message: 'Task report sent to developers.',
    });
  } catch (err) {
    console.error('Email dev report error:', err.message);
    res.status(500).json({ error: err.message || 'Could not send dev report' });
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
