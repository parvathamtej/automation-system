const nodemailer = require('nodemailer');

function normalizeString(value) {
  return String(value || '').trim();
}

function clampNumber(value, min, max, fallback) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return fallback;
  return Math.max(min, Math.min(max, numberValue));
}

function buildPrompt({ topic, currentLevel, timePerDay, goalOrDeadline, background, dayCount }) {
  return `You are a personalized learning roadmap generator.

Create a short, practical day-wise learning plan.

Inputs:
- Topic: ${topic}
- Current level: ${currentLevel}
- Time per day: ${timePerDay}
- Goal/deadline: ${goalOrDeadline || '(not provided)'}
- Background: ${background || '(not provided)'}

Output requirements:
- Create a ${dayCount}-day plan.
- For each day: include a title, 2-5 topics, and 2-4 tasks (practice / mini project).

Return ONLY valid JSON:
{
  "topic": "${topic}",
  "timePerDay": "${timePerDay}",
  "duration": "${dayCount} days",
  "summary": "...",
  "days": [
    {
      "day": "Day 1",
      "title": "...",
      "topics": ["...", "..."],
      "tasks": ["...", "..."]
    }
  ]
}`;
}

function inferDayCount(timePerDay) {
  const normalized = normalizeString(timePerDay).toLowerCase();
  if (normalized.includes('3')) return 5;
  if (normalized.includes('2')) return 7;
  return 5;
}

function heuristicPlan({ topic, currentLevel, timePerDay, goalOrDeadline }) {
  const level = normalizeString(currentLevel) || 'Intermediate';
  const time = normalizeString(timePerDay) || '2 hours';
  const dayCount = inferDayCount(time);
  const duration = `${dayCount} days`;

  const topicText = normalizeString(topic) || 'Your topic';
  const goalText = normalizeString(goalOrDeadline);
  const focusGoal = goalText ? ` Goal: ${goalText}.` : '';

  const topicKey = topicText.toLowerCase();
  const isReact = topicKey.includes('react');
  const isDsa = topicKey.includes('dsa') || topicKey.includes('data structures') || topicKey.includes('algorithms');
  const isMl = topicKey.includes('machine learning') || topicKey.includes('ml');

  const dayTemplates = isReact
    ? [
        { title: 'Basics', topics: ['JSX', 'project setup', 'rendering'], tasks: ['Create a small app scaffold', 'Build 2 simple UI sections'] },
        { title: 'Components', topics: ['components', 'props', 'composition'], tasks: ['Split UI into components', 'Pass props and reuse components'] },
        { title: 'State & Props', topics: ['useState', 'events', 'forms'], tasks: ['Build a form', 'Add validation + error states'] },
        { title: 'Routing & Data', topics: ['fetching data', 'loading states', 'error handling'], tasks: ['Call a public API', 'Show loading + error UI'] },
        { title: 'Mini Project', topics: ['feature polish', 'refactor', 'deploy'], tasks: ['Build a small portfolio-ready feature', 'Write a short README'] },
      ]
    : isDsa
      ? [
          { title: 'Arrays & Strings', topics: ['two pointers', 'hashing', 'complexity'], tasks: ['Solve 4 easy problems', 'Write notes on patterns'] },
          { title: 'Stacks & Queues', topics: ['stack patterns', 'monotonic stack'], tasks: ['Solve 3 problems', 'Implement stack/queue from scratch'] },
          { title: 'Linked Lists', topics: ['reverse', 'cycle detection'], tasks: ['Solve 3 problems', 'Explain solutions aloud'] },
          { title: 'Trees', topics: ['DFS', 'BFS', 'recursion'], tasks: ['Solve 3 problems', 'Draw recursion stack for 1 problem'] },
          { title: 'Dynamic Programming', topics: ['memoization', 'tabulation'], tasks: ['Solve 2 problems', 'Summarize DP approach'] },
        ]
      : isMl
        ? [
            { title: 'Foundations', topics: ['supervised vs unsupervised', 'train/test split'], tasks: ['Set up a notebook', 'Load a dataset and explore'] },
            { title: 'Regression', topics: ['linear regression', 'metrics'], tasks: ['Train a regression model', 'Evaluate with metrics'] },
            { title: 'Classification', topics: ['logistic regression', 'confusion matrix'], tasks: ['Train a classifier', 'Tune a threshold'] },
            { title: 'Features', topics: ['normalization', 'encoding', 'pipelines'], tasks: ['Build a preprocessing pipeline', 'Compare before/after performance'] },
            { title: 'Mini Project', topics: ['end-to-end workflow', 'reporting'], tasks: ['Pick a dataset and build an end-to-end model', 'Write a 1-page summary'] },
          ]
        : [
            { title: 'Basics', topics: ['core concepts', 'setup'], tasks: ['Set up your environment', 'Complete a small starter exercise'] },
            { title: 'Build', topics: ['key features', 'practice'], tasks: ['Implement 1–2 core features', 'Do a focused practice set'] },
            { title: 'Integrate', topics: ['edge cases', 'error handling'], tasks: ['Add error handling', 'Review and refactor for clarity'] },
            { title: 'Apply', topics: ['mini project', 'real use case'], tasks: ['Build a mini project', 'Document what you learned'] },
            { title: 'Polish', topics: ['review', 'ship'], tasks: ['Polish and finalize', 'Create a checklist for next steps'] },
          ];

  return {
    topic: topicText,
    timePerDay: time,
    duration,
    summary: `A ${duration} roadmap (${time}/day) for a ${level} learner to get started with ${topicText}.${focusGoal}`.trim(),
    days: dayTemplates.slice(0, dayCount).map((day, index) => ({
      day: `Day ${index + 1}`,
      title: day.title,
      topics: day.topics,
      tasks: day.tasks,
    })),
  };
}

async function generateLearningPath(payload) {
  const topic = normalizeString(payload?.topic || payload?.goal);
  const currentLevel = normalizeString(payload?.currentLevel);
  const timePerDay = normalizeString(payload?.timePerDay || payload?.timePerWeek);
  const background = normalizeString(payload?.background);
  const goalOrDeadline = normalizeString(payload?.goalOrDeadline);

  if (!topic) {
    throw new Error('Missing required field: topic');
  }

  const openAiKey = normalizeString(process.env.OPENAI_API_KEY);
  if (!openAiKey) {
    return heuristicPlan({ topic, currentLevel, timePerDay, goalOrDeadline });
  }

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const dayCount = inferDayCount(timePerDay);
    const prompt = buildPrompt({ topic, currentLevel, timePerDay, goalOrDeadline, background, dayCount });
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

    if (!parsed?.summary || !Array.isArray(parsed?.days)) {
      throw new Error('OpenAI returned an unexpected payload');
    }

    return {
      topic: String(parsed.topic || topic),
      timePerDay: String(parsed.timePerDay || timePerDay || '2 hours'),
      summary: String(parsed.summary),
      duration: String(parsed.duration || `${inferDayCount(timePerDay)} days`),
      days: parsed.days.slice(0, 7).map((day, index) => ({
        day: String(day?.day || `Day ${index + 1}`),
        title: String(day?.title || 'Focus'),
        topics: Array.isArray(day?.topics) ? day.topics.map(String).slice(0, 6) : [],
        tasks: Array.isArray(day?.tasks) ? day.tasks.map(String).slice(0, 6) : [],
      })),
    };
  } catch (error) {
    return {
      ...heuristicPlan({ topic, currentLevel, timePerDay, goalOrDeadline }),
      llm_error: error.message,
    };
  }
}

function createTransportIfConfigured() {
  if (String(process.env.ENABLE_SMTP || '').toLowerCase() !== 'true') {
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

function buildPlanEmailBody({ inputs, plan }) {
  const days = Array.isArray(plan?.days)
    ? plan.days
    : Array.isArray(plan?.weeks)
      ? plan.weeks.map((week, index) => ({
          day: `Day ${index + 1}`,
          title: week.title || `Week ${index + 1}`,
          topics: week.focus ? [week.focus] : [],
          tasks: [],
        }))
      : [];

  const daysText = days
    .map((day) => {
      const topics = Array.isArray(day.topics) ? day.topics.join(', ') : '';
      const tasks = Array.isArray(day.tasks) ? day.tasks.join(' | ') : '';
      return `- ${day.day} (${day.title})\n  Topics: ${topics}\n  Tasks: ${tasks}`;
    })
    .join('\n');

  return `AI LEARNING ROADMAP (CONFIRMED)

Inputs
------
Topic: ${inputs.topic || inputs.goal}
Current level: ${inputs.currentLevel}
Time per day: ${inputs.timePerDay || inputs.timePerWeek}
Goal/deadline: ${inputs.goalOrDeadline || '(not provided)'}
Background: ${inputs.background || '(not provided)'}

Plan
----
Summary: ${plan.summary}
Duration: ${plan.duration}

Day-wise plan:
${daysText}
`;
}

async function confirmLearningPath({ inputs, plan }) {
  const to = normalizeString(process.env.DEV_TEAM_EMAIL) || normalizeString(process.env.EMAIL_USER);
  const subject = `[Learning Roadmap] Confirmed - ${
    normalizeString(inputs?.topic || inputs?.goal).slice(0, 64) || 'New plan'
  }`;
  const body = buildPlanEmailBody({ inputs, plan });

  const transporter = createTransportIfConfigured();
  if (!transporter || !to) {
    console.log('[learning-path] Confirmation simulated (no SMTP configured).', { to, subject, body });
    return {
      status: 'simulated',
      provider: 'console',
      message: 'Plan logged to server console (SMTP not configured).',
      to: to || null,
    };
  }

  const startedAt = Date.now();
  const info = await transporter.sendMail({
    from: `"AI Workflow System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: body,
  });

  return {
    status: 'sent',
    provider: 'Gmail SMTP',
    durationMs: clampNumber(Date.now() - startedAt, 0, 60_000, 0),
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
    to,
  };
}

module.exports = {
  generateLearningPath,
  confirmLearningPath,
};
