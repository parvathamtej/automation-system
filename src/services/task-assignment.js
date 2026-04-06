const nodemailer = require('nodemailer');

function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeEmails(value) {
  const raw = normalizeString(value);
  if (!raw) return [];
  return raw
    .split(/[,;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstNonEmptyList(...lists) {
  for (const list of lists) {
    if (Array.isArray(list) && list.length) return list;
  }
  return [];
}

function clampNumber(value, min, max, fallback) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return fallback;
  return Math.max(min, Math.min(max, numberValue));
}

function toIsoDateOrNull(value) {
  const raw = normalizeString(value);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildAssignmentsCsv(assignments) {
  const rows = Array.isArray(assignments) ? assignments : [];
  const header = ['Task', 'Assigned To', 'Role', 'Deadline', 'Status'];
  const lines = [header.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.task,
        row.assignedTo,
        row.role,
        row.deadline,
        row.status || 'Assigned',
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  return lines.join('\n');
}

function createTransportIfConfigured() {
  const enableSmtp = String(process.env.ENABLE_SMTP || '').trim().toLowerCase();
  if (enableSmtp === 'false' || enableSmtp === '0' || enableSmtp === 'no') {
    return null;
  }

  const user = normalizeString(process.env.EMAIL_USER);
  const pass = normalizeString(process.env.EMAIL_PASS);
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

function validateTeamMembers(teamMembers) {
  const members = Array.isArray(teamMembers) ? teamMembers : [];
  const cleaned = members
    .map((member) => ({
      name: normalizeString(member?.name),
      role: normalizeString(member?.role),
      email: normalizeString(member?.email),
    }))
    .filter((member) => member.name && member.role && member.email);

  if (!cleaned.length) {
    throw new Error('Missing required field: teamMembers (name, role, email)');
  }
  return cleaned;
}

function buildPrompt({ taskDescription, deadline, teamMembers }) {
  const membersText = teamMembers
    .map((member) => `- ${member.name} (${member.role}) <${member.email}>`)
    .join('\n');

  return `You are an AI task breakdown and assignment assistant.

Given a task/goal, break it into 5-10 smaller actionable steps and assign each step to the most appropriate team member based on their role.

Inputs:
- Task description: ${taskDescription}
- Deadline: ${deadline || '(not provided)'}
- Team members:
${membersText}

Output requirements:
- Return ONLY valid JSON. No markdown. No extra text.
- Create 5-10 tasks. Each task should be specific and actionable.
- Choose exactly one assignee per task from the provided team members.
- Include the assignee role and email.
- Use deadline from inputs (if missing, infer a reasonable date window as a string).
- Status should be "Assigned".

Return JSON in this schema:
{
  "summary": "...",
  "assignments": [
    {
      "task": "...",
      "assignedTo": "...",
      "role": "...",
      "email": "...",
      "deadline": "...",
      "status": "Assigned"
    }
  ]
}`;
}

function pickAssigneeForTask(taskText, teamMembers) {
  const lower = String(taskText || '').toLowerCase();
  const scored = teamMembers.map((member, index) => {
    const role = member.role.toLowerCase();
    let score = 0;

    const roleSignals = [
      { k: ['frontend', 'ui', 'react', 'web'], r: ['frontend', 'ui', 'react', 'web'] },
      { k: ['backend', 'api', 'node', 'server', 'db', 'database'], r: ['backend', 'api', 'node', 'server', 'db', 'database'] },
      { k: ['qa', 'test', 'testing', 'quality'], r: ['qa', 'test', 'testing', 'quality'] },
      { k: ['devops', 'infra', 'deploy', 'ci', 'cd', 'docker', 'k8s', 'kubernetes'], r: ['devops', 'infra', 'deploy', 'ci', 'cd', 'docker', 'k8s', 'kubernetes'] },
      { k: ['design', 'ux', 'ui'], r: ['design', 'ux', 'ui'] },
      { k: ['pm', 'product', 'requirements', 'spec'], r: ['pm', 'product'] },
    ];

    for (const signal of roleSignals) {
      const taskMatch = signal.k.some((w) => lower.includes(w));
      const roleMatch = signal.r.some((w) => role.includes(w));
      if (taskMatch && roleMatch) score += 4;
      else if (roleMatch) score += 1;
    }

    if (role.includes('lead') || role.includes('manager')) score += 0.5;

    return { member, score, index };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored[0]?.member || teamMembers[0];
}

function heuristicAnalyzeTask({ taskDescription, deadline, teamMembers }) {
  const baseDeadline = deadline || 'ASAP';
  const raw = normalizeString(taskDescription);
  const sentences = raw
    .split(/[\n\.]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const baseIdeas = sentences.length ? sentences : [raw];
  const steps = [];

  for (const idea of baseIdeas) {
    const parts = idea
      .split(/\band\b|,|;/gi)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts) {
      if (steps.length >= 10) break;
      steps.push(part);
    }
    if (steps.length >= 10) break;
  }

  while (steps.length < 5) {
    steps.push(`Implement ${steps.length === 0 ? 'the core workflow' : 'supporting changes'} and validate results`);
  }

  const assignments = steps.slice(0, 10).map((step, index) => {
    const assignee = pickAssigneeForTask(step, teamMembers);
    return {
      task: step.length > 6 ? step : `Task step ${index + 1}: ${step}`,
      assignedTo: assignee.name,
      role: assignee.role,
      email: assignee.email,
      deadline: baseDeadline,
      status: 'Assigned',
    };
  });

  return {
    summary: `Generated ${assignments.length} actionable steps and assigned them based on the provided roles.`,
    assignments,
  };
}

async function analyzeTaskAssignment(payload) {
  const taskDescription = normalizeString(payload?.taskDescription || payload?.task || payload?.goal);
  const deadline = normalizeString(payload?.deadline) || toIsoDateOrNull(payload?.deadline) || '';
  const teamMembers = validateTeamMembers(payload?.teamMembers);

  if (!taskDescription) throw new Error('Missing required field: taskDescription');

  const openAiKey = normalizeString(process.env.OPENAI_API_KEY);
  if (!openAiKey) {
    return heuristicAnalyzeTask({ taskDescription, deadline, teamMembers });
  }

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const prompt = buildPrompt({ taskDescription, deadline, teamMembers });
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'Return only valid JSON. No markdown. No extra text.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`OpenAI request failed (${response.status}): ${detail || response.statusText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    if (!parsed?.summary || !Array.isArray(parsed?.assignments)) {
      throw new Error('OpenAI returned an unexpected payload');
    }

    const assignments = parsed.assignments.slice(0, 12).map((item) => ({
      task: normalizeString(item?.task),
      assignedTo: normalizeString(item?.assignedTo),
      role: normalizeString(item?.role),
      email: normalizeString(item?.email),
      deadline: normalizeString(item?.deadline) || deadline || 'ASAP',
      status: normalizeString(item?.status) || 'Assigned',
    }));

    return {
      summary: normalizeString(parsed.summary),
      assignments,
    };
  } catch (error) {
    return {
      ...heuristicAnalyzeTask({ taskDescription, deadline, teamMembers }),
      llm_error: error.message,
    };
  }
}

function groupAssignmentsByEmail(assignments) {
  const map = new Map();
  for (const row of Array.isArray(assignments) ? assignments : []) {
    const email = normalizeString(row.email);
    if (!email) continue;
    const list = map.get(email) || [];
    list.push(row);
    map.set(email, list);
  }
  return map;
}

function buildMemberEmailBody({ memberName, taskDescription, deadline, rows }) {
  const tasksText = rows
    .map((row, index) => `- ${index + 1}. ${row.task} (Deadline: ${row.deadline || deadline || 'ASAP'})`)
    .join('\n');

  return `TASK ASSIGNMENT

Hello ${memberName},

You have been assigned tasks for the following goal:
${taskDescription}

Deadline: ${deadline || 'ASAP'}

Your tasks:
${tasksText}

Status: Assigned
`;
}

async function confirmTaskAssignment({ inputs, analysis }) {
  const taskDescription = normalizeString(inputs?.taskDescription || inputs?.task || inputs?.goal);
  const deadline = normalizeString(inputs?.deadline) || toIsoDateOrNull(inputs?.deadline) || '';
  const teamMembers = validateTeamMembers(inputs?.teamMembers);
  const assignments = Array.isArray(analysis?.assignments) ? analysis.assignments : [];

  if (!taskDescription) throw new Error('Missing required inputs.taskDescription');
  if (!assignments.length) throw new Error('Missing required analysis.assignments');

  const transporter = createTransportIfConfigured();
  if (!transporter) {
    console.log('[task-assignment] Confirm simulated (SMTP disabled/unconfigured).', { inputs, analysis });
    return {
      status: 'simulated',
      provider: 'console',
      message: 'Assignments logged to server console (SMTP disabled/unconfigured).',
    };
  }

  const memberByEmail = new Map(teamMembers.map((m) => [m.email, m]));
  const grouped = groupAssignmentsByEmail(assignments);

  const startedAt = Date.now();
  const results = [];

  for (const [email, rows] of grouped.entries()) {
    const member = memberByEmail.get(email) || { name: email, role: '', email };
    const subject = `[Task Assignment] ${normalizeString(taskDescription).slice(0, 72) || 'New tasks'}`;
    const text = buildMemberEmailBody({
      memberName: member.name,
      taskDescription,
      deadline,
      rows,
    });

    // eslint-disable-next-line no-await-in-loop
    const info = await transporter.sendMail({
      from: `"AI Workflow System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text,
    });

    results.push({
      to: email,
      accepted: info.accepted || [],
      rejected: info.rejected || [],
      messageId: info.messageId,
    });
  }

  return {
    status: 'sent',
    provider: 'Gmail SMTP',
    durationMs: clampNumber(Date.now() - startedAt, 0, 60_000, 0),
    results,
    message: 'Assignments emailed to team members.',
  };
}

async function emailTaskReportToDevTeam({ inputs, analysis }) {
  const taskDescription = normalizeString(inputs?.taskDescription || inputs?.task || inputs?.goal);
  const deadline = normalizeString(inputs?.deadline) || toIsoDateOrNull(inputs?.deadline) || '';
  const assignments = Array.isArray(analysis?.assignments) ? analysis.assignments : [];

  if (!taskDescription) throw new Error('Missing required inputs.taskDescription');
  if (!assignments.length) throw new Error('Missing required analysis.assignments');

  const recipients = firstNonEmptyList(
    normalizeEmails(process.env.DEV_TEAM_EMAIL),
    normalizeEmails(process.env.DEV_TEAM_EMAILS),
    normalizeEmails(process.env.EMAIL_TO),
  );
  const fallback = normalizeString(process.env.EMAIL_USER);
  const toList = recipients.length ? recipients : fallback ? [fallback] : [];

  const transporter = createTransportIfConfigured();
  if (!transporter || !toList.length) {
    console.log('[task-assignment] Dev report simulated (SMTP disabled/unconfigured).', { to: toList, inputs, analysis });
    return {
      status: 'simulated',
      provider: 'console',
      message: 'Report logged to server console (SMTP disabled/unconfigured).',
      to: toList.length ? toList.join(', ') : null,
    };
  }

  const csv = buildAssignmentsCsv(assignments);
  const subject = `[Task Assignments] ${normalizeString(taskDescription).slice(0, 72) || 'Task breakdown'}`;

  const startedAt = Date.now();
  const info = await transporter.sendMail({
    from: `"AI Workflow System" <${process.env.EMAIL_USER}>`,
    to: toList.join(', '),
    subject,
    text: `Task: ${taskDescription}\nDeadline: ${deadline || 'ASAP'}\n\nSummary:\n${normalizeString(analysis?.summary)}\n`,
    attachments: [
      {
        filename: 'task-assignments.csv',
        content: csv,
      },
    ],
  });

  return {
    status: 'sent',
    provider: 'Gmail SMTP',
    durationMs: clampNumber(Date.now() - startedAt, 0, 60_000, 0),
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
    to: toList.join(', '),
  };
}

module.exports = {
  analyzeTaskAssignment,
  confirmTaskAssignment,
  emailTaskReportToDevTeam,
  buildAssignmentsCsv,
};

