function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function classifyIntent(message, workflowId) {
  const text = String(message || "").toLowerCase();

  if (workflowId === "lead-qualification") {
    if (text.includes("demo") || text.includes("solution")) return "High-intent lead";
    if (text.includes("pricing") || text.includes("quote")) return "Commercial inquiry";
    return "General lead";
  }

  if (workflowId === "support-escalation") {
    if (text.includes("failing") || text.includes("impacting")) return "Service disruption";
    if (text.includes("bug") || text.includes("error")) return "Technical incident";
    return "General support";
  }

  if (workflowId === "renewal-rescue") {
    if (text.includes("expires") || text.includes("drop")) return "Churn risk";
    if (text.includes("payment")) return "Revenue risk";
    return "Retention watch";
  }

  return "Unclassified";
}

function buildPersonalization(payload) {
  const segment = payload.customerSegment || "General";
  const tone =
    payload.sentiment === "negative"
      ? "high-empathy"
      : payload.sentiment === "positive"
        ? "confidence-building"
        : "advisory";

  return {
    audience: segment,
    preferredTone: tone,
    outreachChannel: payload.channel || "email",
  };
}

function scoreUrgency(payload, workflow) {
  let score = Number(payload.urgency) || 50;
  const text = String(payload.message || "").toLowerCase();
  const segment = String(payload.customerSegment || "").toLowerCase();

  if (text.includes("urgent") || text.includes("right now")) score += 10;
  if (text.includes("month") || text.includes("expires")) score += 6;
  if (text.includes("failing") || text.includes("impacting")) score += 12;
  if (segment.includes("enterprise") && workflow.rules.enterprisePriority) score += 8;
  if (segment.includes("vip") && workflow.rules.vipBoost) score += workflow.rules.vipBoost;
  if (text.includes("drop") && workflow.rules.churnBoost) score += workflow.rules.churnBoost;

  return clamp(score, 1, 100);
}

function determineRoute(payload, workflow, score, intent) {
  if (score >= workflow.rules.urgencyThreshold) {
    if (workflow.id === "lead-qualification") {
      return {
        label: "Fast-track to sales orchestration",
        reason: `${intent} exceeded the qualification threshold and needs immediate sales follow-up.`,
      };
    }

    if (workflow.id === "support-escalation") {
      return {
        label: "Priority incident response",
        reason: `${intent} shows urgency above the escalation threshold and requires rapid handling.`,
      };
    }

    return {
      label: "Retention intervention",
      reason: `${intent} crossed the churn threshold and should trigger an assisted rescue flow.`,
    };
  }

  return {
    label: "Standard automation path",
    reason: `${intent} can be handled through the default workflow branch without human escalation.`,
  };
}

function analyze(payload, workflow) {
  const intent = classifyIntent(payload.message, workflow.id);
  const personalization = buildPersonalization(payload);
  const urgencyScore = scoreUrgency(payload, workflow);
  const route = determineRoute(payload, workflow, urgencyScore, intent);

  return {
    intent,
    personalization,
    urgencyScore,
    route,
    aiSummary: `The AI layer identified "${intent}" for ${payload.customerName || "this customer"}, selected a ${personalization.preferredTone} response style, and recommended the "${route.label}" branch.`,
  };
}

module.exports = {
  analyze,
};
