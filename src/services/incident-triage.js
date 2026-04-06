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

function uniqueEmails(list) {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(list) ? list : []) {
    const email = normalizeString(item).toLowerCase();
    if (!email) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    out.push(item);
  }
  return out;
}

function severityFromImpact(impact) {
  const normalized = normalizeString(impact).toLowerCase();
  if (normalized === 'severe') return 'high';
  if (normalized === 'moderate') return 'medium';
  return 'low';
}

function buildPrompt({ whatWentWrong, where, observedIssue, impact }) {
  return `Analyze the following user-reported issue:

What went wrong: ${whatWentWrong}
Where: ${where}
Observed issue: ${observedIssue}
Impact: ${impact}

Generate:
1. A short summary of the problem
2. Likely root cause
3. Suggested action

Return structured JSON:
{
  "summary": "...",
  "root_cause": "...",
  "suggested_action": "...",
  "severity": "low/medium/high"
}`;
}

function heuristicIncidentAnalysis({ whatWentWrong, where, observedIssue, impact }) {
  const whereText = normalizeString(where) || 'the application';
  const observedText = normalizeString(observedIssue) || 'an issue';
  const whatText = normalizeString(whatWentWrong) || 'A problem was reported.';
  const severity = severityFromImpact(impact);

  let rootCause = 'Insufficient data to pinpoint a single root cause; likely a client/server error path triggered by the reported action.';
  let suggestedAction = 'Collect console logs + network traces, reproduce the steps, and add error handling + telemetry around the failing path.';

  const lower = `${whatText} ${observedText}`.toLowerCase();
  if (lower.includes('login') || lower.includes('auth')) {
    rootCause = 'Authentication flow failed (token/session/cookie issue, invalid credentials handling, or backend auth endpoint error).';
    suggestedAction =
      'Check `/api` auth responses, verify CORS/cookie settings, inspect token storage, and ensure the login handler gracefully surfaces backend errors.';
  } else if (lower.includes('payment') || lower.includes('checkout')) {
    rootCause = 'Payments flow failed (gateway error, validation failure, missing configuration, or backend transaction failure).';
    suggestedAction =
      'Verify payment config/keys, validate request payloads, inspect server logs for provider error codes, and add retries/idempotency for critical steps.';
  } else if (lower.includes('slow') || observedText.toLowerCase().includes('slow')) {
    rootCause = 'Performance regression or downstream dependency latency (API, DB, third-party service).';
    suggestedAction =
      'Measure API timings, identify the slow endpoint, add caching where safe, and profile the slowest frontend render/network waterfall.';
  } else if (lower.includes('crash') || observedText.toLowerCase().includes('crashed')) {
    rootCause = 'Unhandled exception in the UI or backend leading to a hard failure.';
    suggestedAction =
      'Capture stack traces, wrap risky code paths in try/catch (or error boundaries), validate inputs, and add guardrails for null/undefined access.';
  } else if (lower.includes('error message') || observedText.toLowerCase().includes('error')) {
    rootCause = 'A backend/API error or validation failure surfaced to the UI.';
    suggestedAction =
      'Check the API response body/status, confirm request payload fields, and ensure the UI renders a helpful error state with remediation steps.';
  }

  return {
    summary: `${observedText} reported in ${whereText}. ${whatText}`.trim(),
    root_cause: rootCause,
    suggested_action: suggestedAction,
    severity,
  };
}

function coerceInputs(payload) {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.inputs && typeof payload.inputs === 'object') return payload.inputs;

  if (payload.message && !payload.whatWentWrong) {
    return {
      whatWentWrong: payload.message,
      where: payload.where,
      observedIssue: payload.observedIssue,
      impact: payload.impact,
    };
  }

  return payload;
}

async function analyzeIncident(payload) {
  const inputs = coerceInputs(payload);
  const whatWentWrong = normalizeString(inputs?.whatWentWrong);
  const where = normalizeString(inputs?.where);
  const observedIssue = normalizeString(inputs?.observedIssue);
  const impact = normalizeString(inputs?.impact);

  if (!whatWentWrong) {
    throw new Error('Missing required field: whatWentWrong');
  }

  const prompt = buildPrompt({ whatWentWrong, where, observedIssue, impact });

  const openAiKey = normalizeString(process.env.OPENAI_API_KEY);
  if (!openAiKey) {
    return heuristicIncidentAnalysis({ whatWentWrong, where, observedIssue, impact });
  }

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are an incident triage assistant. Return ONLY valid JSON matching the requested schema. No markdown.',
          },
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

    if (!parsed?.summary || !parsed?.root_cause || !parsed?.suggested_action) {
      throw new Error('OpenAI returned an unexpected payload');
    }

    return {
      summary: String(parsed.summary),
      root_cause: String(parsed.root_cause),
      suggested_action: String(parsed.suggested_action),
      severity: String(parsed.severity || severityFromImpact(impact)),
    };
  } catch (error) {
    return {
      ...heuristicIncidentAnalysis({ whatWentWrong, where, observedIssue, impact }),
      llm_error: error.message,
    };
  }
}

function inferOwnerDomain({ inputs, analysis }) {
  const where = normalizeString(inputs?.where).toLowerCase();
  const observed = normalizeString(inputs?.observedIssue).toLowerCase();
  const what = normalizeString(inputs?.whatWentWrong).toLowerCase();
  const text = `${where} ${observed} ${what} ${normalizeString(analysis?.root_cause).toLowerCase()} ${normalizeString(
    analysis?.suggested_action,
  ).toLowerCase()}`;

  const isBackend =
    where.includes('api') ||
    where.includes('backend') ||
    text.includes('endpoint') ||
    text.includes('server') ||
    text.includes('database') ||
    text.includes('db') ||
    text.includes('500') ||
    text.includes('timeout') ||
    text.includes('gateway');

  const isFrontend =
    where.includes('login') ||
    where.includes('auth') ||
    where.includes('dashboard') ||
    text.includes('ui') ||
    text.includes('frontend') ||
    text.includes('react') ||
    text.includes('render') ||
    text.includes('browser') ||
    text.includes('console');

  if (isBackend && isFrontend) return 'both';
  if (isBackend) return 'backend';
  if (isFrontend) return 'frontend';

  // Default: treat unknown as backend+frontend so nothing gets missed.
  return 'both';
}

function buildTicketEmailBody({ inputs, analysis }) {
  return `AI INCIDENT TRIAGE TICKET

Inputs
------
What went wrong: ${inputs.whatWentWrong}
Where: ${inputs.where}
Observed issue: ${inputs.observedIssue}
Impact: ${inputs.impact}

AI Analysis
----------
Summary: ${analysis.summary}
Root cause: ${analysis.root_cause}
Suggested action: ${analysis.suggested_action}
Severity: ${analysis.severity}
`;
}

function buildDeveloperEmailBody({ inputs, analysis, domain }) {
  const owner = String(domain || 'both').toUpperCase();
  return `AI INCIDENT TRIAGE TICKET (ROUTED: ${owner})

User report
-----------
What went wrong: ${inputs.whatWentWrong}
Where: ${inputs.where}
Observed issue: ${inputs.observedIssue}
Impact: ${inputs.impact}

AI summary
----------
Summary: ${analysis.summary}
Likely root cause: ${analysis.root_cause}
Suggested action / solution: ${analysis.suggested_action}
Severity: ${analysis.severity}

Notes
-----
This ticket was automatically routed to the ${owner} owner based on the reported domain + analysis signals.
`;
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

function recipientsForDomain(domain) {
  const frontend = firstNonEmptyList(
    normalizeEmails(process.env.FRONTEND_DEV_EMAIL),
    normalizeEmails(process.env.FRONTEND_DEV_EMAILS),
  );
  const backend = firstNonEmptyList(
    normalizeEmails(process.env.BACKEND_DEV_EMAIL),
    normalizeEmails(process.env.BACKEND_DEV_EMAILS),
  );

  if (domain === 'frontend') return frontend;
  if (domain === 'backend') return backend;
  return uniqueEmails([...frontend, ...backend]);
}

async function raiseIncidentTicket({ inputs, analysis }) {
  const domain = inferOwnerDomain({ inputs, analysis });

  const routed = recipientsForDomain(domain);
  const generalRecipients = firstNonEmptyList(
    normalizeEmails(process.env.DEV_TEAM_EMAIL),
    normalizeEmails(process.env.DEV_TEAM_EMAILS),
    normalizeEmails(process.env.EMAIL_TO),
  );

  const fallback = normalizeString(process.env.EMAIL_USER);
  const baseRecipients = routed.length ? routed : generalRecipients.length ? generalRecipients : fallback ? [fallback] : [];
  const toList = uniqueEmails(baseRecipients);

  const subject = `[Incident Triage][${String(domain || 'both').toUpperCase()}] ${(analysis.severity || 'unknown').toUpperCase()} - ${
    inputs.where || 'Unknown module'
  }`;
  const body = buildDeveloperEmailBody({ inputs, analysis, domain });

  const transporter = createTransportIfConfigured();
  if (!transporter || !toList.length) {
    console.log('[incident-triage] Ticket simulated (SMTP disabled/unconfigured).', { to: toList, subject, body });
    return {
      status: 'simulated',
      provider: 'console',
      message: 'Ticket logged to server console (SMTP disabled/unconfigured).',
      to: toList.length ? toList.join(', ') : null,
      domain,
    };
  }

  console.log('[incident-triage] Sending routed ticket email.', { domain, to: toList.join(', '), subject });
  const startedAt = Date.now();
  const info = await transporter.sendMail({
    from: `"AI Workflow System" <${process.env.EMAIL_USER}>`,
    to: toList.join(', '),
    subject,
    text: body,
  });

  return {
    status: 'sent',
    provider: 'Gmail SMTP',
    durationMs: Date.now() - startedAt,
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
    to: toList.join(', '),
    domain,
  };
}

module.exports = {
  analyzeIncident,
  raiseIncidentTicket,
};
