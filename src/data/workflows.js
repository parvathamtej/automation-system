const workflowCatalog = [
  {
    id: "lead-qualification",
    name: "Lead Qualification",
    category: "Revenue",
    summary: "Scores incoming leads, personalizes outreach, and syncs qualified contacts to CRM.",
    triggers: ["New web form submission", "Campaign click event", "Inbound demo request"],
    actions: ["Email sequence", "Sales notification", "CRM upsert"],
    rules: {
      urgencyThreshold: 75,
      enterprisePriority: true,
    },
  },
  {
    id: "support-escalation",
    name: "Support Escalation",
    category: "Customer Success",
    summary: "Classifies ticket urgency, chooses response path, and alerts the right teams.",
    triggers: ["New ticket", "Negative CSAT", "VIP customer reply"],
    actions: ["Slack alert", "Priority queue routing", "Follow-up email"],
    rules: {
      urgencyThreshold: 80,
      vipBoost: 15,
    },
  },
  {
    id: "renewal-rescue",
    name: "Renewal Rescue",
    category: "Retention",
    summary: "Detects churn risk, proposes intervention, and launches retention plays.",
    triggers: ["Low product usage", "Contract nearing expiry", "Payment failure"],
    actions: ["Success manager task", "Offer notification", "CRM activity log"],
    rules: {
      urgencyThreshold: 70,
      churnBoost: 20,
    },
  },
];

const scenarios = [
  {
    id: "enterprise-lead",
    label: "Enterprise lead with urgent buying intent",
    payload: {
      workflowId: "lead-qualification",
      source: "Website demo request",
      customerName: "Northstar Health",
      customerSegment: "Enterprise",
      message: "We need a workflow automation solution for three regional teams within this month.",
      channel: "email",
      sentiment: "positive",
      urgency: 82,
    },
  },
  {
    id: "vip-support",
    label: "VIP support ticket with frustration signals",
    payload: {
      workflowId: "support-escalation",
      source: "Support portal",
      customerName: "Aster Retail",
      customerSegment: "VIP",
      message: "Our notification workflow is failing and this is impacting customers right now.",
      channel: "portal",
      sentiment: "negative",
      urgency: 88,
    },
  },
  {
    id: "renewal-risk",
    label: "Renewal account showing churn risk",
    payload: {
      workflowId: "renewal-rescue",
      source: "CRM usage sync",
      customerName: "Vertex Logistics",
      customerSegment: "Mid-market",
      message: "Usage has dropped 60 percent and the contract expires in 17 days.",
      channel: "crm",
      sentiment: "neutral",
      urgency: 74,
    },
  },
];

module.exports = {
  workflowCatalog,
  scenarios,
};
