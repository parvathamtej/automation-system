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
    id: "task-assignment",
    name: "AI Task Breakdown & Smart Assignment",
    category: "Operations",
    summary: "Breaks down a goal into steps, assigns by role, emails assignees, and produces an Excel-ready report.",
    triggers: ["New project brief", "Sprint planning", "Incoming implementation request"],
    actions: ["Task breakdown", "Smart assignment", "Email dispatch", "Excel report generation"],
    rules: {
      urgencyThreshold: 0,
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
    id: "task-assignment",
    label: "Task breakdown and smart assignment",
    payload: {
      workflowId: "task-assignment",
      taskDescription:
        "Build the task assignment workflow: analyze goal, break into steps, assign owners by role, email assignees, and generate an Excel-ready report.",
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      teamMembers: [
        { name: "Asha", role: "Frontend (React)", email: "asha@example.com" },
        { name: "Vikram", role: "Backend (Node/API)", email: "vikram@example.com" },
        { name: "Neha", role: "QA / Testing", email: "neha@example.com" },
      ],
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
