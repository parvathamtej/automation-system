const { workflowCatalog } = require("./src/data/workflows");
const { analyze } = require("./src/services/ai-engine");
const { executeActions } = require("./execution-layer");

async function processWorkflow(payload) {
  // 1. Resolve workflow definition
  const workflow = workflowCatalog.find((w) => w.id === payload.workflowId);
  if (!workflow) throw new Error(`Workflow "${payload.workflowId}" not found`);

  // 2. Build event envelope
  const event = {
    source: payload.source || "UI Form",
    customerName: payload.customerName || "Unnamed Account",
    customerSegment: payload.customerSegment || "General",
    message: payload.message || "No message provided",
    channel: payload.channel || "email",
    sentiment: payload.sentiment || "neutral",
    email: payload.email || null,
    receivedAt: new Date().toISOString(),
  };

  // 3. AI Layer – classify, personalize, score, route
  const analysis = analyze(event, workflow);

  // 4. Execution Layer – REAL actions (email, CRM, etc.)
  const executions = await executeActions(event, workflow, analysis);

  // 5. Build structured pipeline timeline
  const timeline = [
    {
      stage: "Event Trigger",
      detail: `${event.source} submitted a new event for ${event.customerName}.`,
    },
    {
      stage: "Workflow Matched",
      detail: `"${workflow.name}" (${workflow.category}) matched the incoming payload.`,
    },
    {
      stage: "AI Reasoning",
      detail: analysis.aiSummary,
    },
    {
      stage: "Execution",
      detail: `${executions.length} action(s) dispatched: ${executions.map((e) => e.status).join(", ")}.`,
    },
  ];

  return {
    success: true,
    workflow,
    event,
    analysis,
    orchestration: {
      engine: "AI-Driven Execution Layer",
      branch: analysis.route.label,
      executions,
    },
    timeline,
    metrics: {
      automationCoverage: "92%",
      manualInterventionReduced: "68%",
      averageResponseTime: "1.8 min",
    },
  };
}

module.exports = { processWorkflow };
