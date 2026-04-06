const nodemailer = require('nodemailer');
const { workflowCatalog } = require('../data/workflows');
const { analyze } = require('./ai-engine');

function normalizeString(value) {
  return String(value || '').trim();
}

function resolveSeverity(urgencyScore) {
  const score = Number(urgencyScore) || 0;
  if (score >= 80) return 'high';
  if (score >= 55) return 'medium';
  return 'low';
}

function getSupportWorkflow() {
  return workflowCatalog.find((workflow) => workflow.id === 'support-escalation');
}

async function analyzeSupportEscalation(payload) {
  const message = normalizeString(payload?.message);
  const customerName = normalizeString(payload?.customerName) || 'Customer';

  if (!message) {
    throw new Error('Missing required field: message');
  }

  const workflow = getSupportWorkflow();
  if (!workflow) {
    throw new Error('Support escalation workflow not found');
  }

  const normalized = {
    customerName,
    customerSegment: normalizeString(payload?.customerSegment) || 'General',
    source: normalizeString(payload?.source) || 'Support portal',
    sentiment: normalizeString(payload?.sentiment) || 'neutral',
    urgency: payload?.urgency,
    message,
    channel: normalizeString(payload?.channel) || 'portal',
  };

  const analysis = analyze(normalized, workflow);

  return {
    summary: `Support issue for ${customerName}: ${analysis.intent}.`,
    recommended_route: analysis.route.label,
    route_reason: analysis.route.reason,
    urgency_score: analysis.urgencyScore,
    severity: resolveSeverity(analysis.urgencyScore),
    suggested_action:
      analysis.urgencyScore >= workflow.rules.urgencyThreshold
        ? 'Escalate to the on-call engineer, notify stakeholders, and prioritize triage with a clear timeline.'
        : 'Acknowledge the issue, request logs/repro steps, and route to the standard support queue.',
  };
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

function buildEscalationEmailBody({ inputs, analysis }) {
  return `AI SUPPORT ESCALATION (CONFIRMED)

Inputs
------
Customer: ${inputs.customerName}
Segment: ${inputs.customerSegment}
Source: ${inputs.source}
Channel: ${inputs.channel}
Sentiment: ${inputs.sentiment}
Urgency: ${inputs.urgency}
Message: ${inputs.message}

AI Analysis
----------
Summary: ${analysis.summary}
Recommended route: ${analysis.recommended_route}
Reason: ${analysis.route_reason}
Urgency score: ${analysis.urgency_score}
Severity: ${analysis.severity}
Suggested action: ${analysis.suggested_action}
`;
}

async function confirmSupportEscalation({ inputs, analysis }) {
  const to = normalizeString(process.env.DEV_TEAM_EMAIL) || normalizeString(process.env.EMAIL_USER);
  const subject = `[Support Escalation] ${analysis.severity?.toUpperCase?.() || 'UNKNOWN'} - ${normalizeString(inputs?.customerName) || 'Customer'}`;
  const body = buildEscalationEmailBody({ inputs, analysis });

  const transporter = createTransportIfConfigured();
  if (!transporter || !to) {
    console.log('[support-escalation] Confirmation simulated (no SMTP configured).', { to, subject, body });
    return {
      status: 'simulated',
      provider: 'console',
      message: 'Escalation logged to server console (SMTP not configured).',
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
    durationMs: Date.now() - startedAt,
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
    to,
  };
}

module.exports = {
  analyzeSupportEscalation,
  confirmSupportEscalation,
};
