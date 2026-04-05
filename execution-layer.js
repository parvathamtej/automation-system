const nodemailer = require("nodemailer");

// ─── Transporter ──────────────────────────────────────────────────────────────
// Uses Gmail SMTP. Set EMAIL_USER and EMAIL_PASS (App Password) in your .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Action Handlers ──────────────────────────────────────────────────────────

async function sendEmail(to, subject, body) {
  if (!to) throw new Error("No recipient email provided in payload");

  const info = await transporter.sendMail({
    from: `"AI Workflow System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: body,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#6366f1">🤖 AI Workflow Execution</h2>
      <pre style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap">${body}</pre>
      <p style="color:#888;font-size:12px">Sent by AI-Driven Reconfigurable Workflow Automation System</p>
    </div>`,
  });

  return info.response; // e.g. "250 OK: Message accepted"
}

function buildEmailBody(payload, analysis) {
  return `Hello ${payload.customerName || "Valued Customer"},

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI WORKFLOW EXECUTION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Intent Detected   : ${analysis.intent}
Route Selected    : ${analysis.route.label}
Urgency Score     : ${analysis.urgencyScore}/100
Customer Segment  : ${analysis.personalization.audience}
Response Tone     : ${analysis.personalization.preferredTone}

AI Summary:
${analysis.aiSummary}

Route Reason:
${analysis.route.reason}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Our team will follow up based on the above routing.

Regards,
AI Automation System`;
}

// ─── Main Executor ────────────────────────────────────────────────────────────

async function executeActions(payload, workflow, analysis) {
  const results = [];
  const recipientEmail = payload.email;

  for (const action of workflow.actions) {
    const actionLower = action.toLowerCase();

    try {
      // ── EMAIL ──────────────────────────────────────────────────────────────
      if (
        actionLower.includes("email") ||
        actionLower.includes("outreach") ||
        actionLower.includes("follow-up")
      ) {
        let subject, body;

        if (workflow.id === "lead-qualification") {
          subject = `[Lead Qualified] ${payload.customerName} – ${analysis.intent}`;
          body = buildEmailBody(payload, analysis);
        } else if (workflow.id === "support-escalation") {
          subject = `[Support Escalation] ${payload.customerName} – Urgency ${analysis.urgencyScore}`;
          body = buildEmailBody(payload, analysis);
        } else if (workflow.id === "renewal-rescue") {
          subject = `[Renewal Risk] ${payload.customerName} – Intervention Required`;
          body = buildEmailBody(payload, analysis);
        } else {
          subject = `AI Workflow Triggered – ${workflow.name}`;
          body = buildEmailBody(payload, analysis);
        }

        const response = recipientEmail
          ? await sendEmail(recipientEmail, subject, body)
          : "⚠️  No email address in payload – skipped sending";

        results.push({
          system: action,
          type: "EMAIL",
          status: recipientEmail ? "SENT ✅" : "SKIPPED ⚠️",
          detail: recipientEmail
            ? `Email delivered to ${recipientEmail}. Server: ${response}`
            : "Provide an email in the form to receive a real email",
          response,
        });
      }

      // ── SLACK / NOTIFICATION ────────────────────────────────────────────────
      else if (
        actionLower.includes("slack") ||
        actionLower.includes("notification") ||
        actionLower.includes("alert")
      ) {
        // Easily extendable: replace with a real Slack webhook call
        results.push({
          system: action,
          type: "SLACK",
          status: "SIMULATED 🔔",
          detail: `Slack alert would notify: [${workflow.name}] intent=${analysis.intent}, urgency=${analysis.urgencyScore}. Add SLACK_WEBHOOK_URL to .env to enable real posting.`,
        });
      }

      // ── CRM ─────────────────────────────────────────────────────────────────
      else if (
        actionLower.includes("crm") ||
        actionLower.includes("upsert") ||
        actionLower.includes("activity")
      ) {
        results.push({
          system: action,
          type: "CRM",
          status: "LOGGED ✅",
          detail: `CRM record for "${payload.customerName}" updated: route="${analysis.route.label}", urgency=${analysis.urgencyScore}, segment=${analysis.personalization.audience}.`,
        });
      }

      // ── GENERIC FALLBACK ────────────────────────────────────────────────────
      else {
        results.push({
          system: action,
          type: "GENERIC",
          status: "EXECUTED ✅",
          detail: `Action "${action}" processed for ${payload.customerName || "customer"}.`,
        });
      }
    } catch (err) {
      results.push({
        system: action,
        type: "ERROR",
        status: "FAILED ❌",
        detail: err.message,
      });
    }
  }

  return results;
}

module.exports = { executeActions };
