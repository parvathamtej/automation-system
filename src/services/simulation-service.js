const { analyze } = require("./ai-engine");
const { orchestrate } = require("./orchestrator");

function findWorkflow(workflowId, workflowCatalog) {
  return workflowCatalog.find((item) => item.id === workflowId);
}

function buildSimulation(payload, workflowCatalog) {
  const workflow = findWorkflow(payload.workflowId, workflowCatalog);

  if (!workflow) {
    throw new Error("Unknown workflow selected");
  }

  const event = {
    source: payload.source || "Unknown source",
    customerName: payload.customerName || "Unnamed account",
    customerSegment: payload.customerSegment || "General",
    message: payload.message || "No message provided",
    channel: payload.channel || "email",
    sentiment: payload.sentiment || "neutral",
    receivedAt: new Date().toISOString(),
  };

  const analysis = analyze(payload, workflow);
  const orchestration = orchestrate(payload, workflow, analysis);

  return {
    workflow,
    event,
    analysis,
    orchestration,
    metrics: {
      automationCoverage: "92%",
      manualInterventionReduced: "68%",
      averageResponseTime: "1.8 min",
    },
    timeline: [
      {
        stage: "Event Trigger",
        detail: `${event.source} submitted a new event for ${event.customerName}.`,
      },
      {
        stage: "Workflow Definition",
        detail: `${workflow.name} matched the incoming event using configurable rules.`,
      },
      {
        stage: "AI Reasoning",
        detail: analysis.aiSummary,
      },
      {
        stage: "Orchestration",
        detail: `${orchestration.engine} executed the ${orchestration.branch.toLowerCase()} branch.`,
      },
    ],
  };
}

module.exports = {
  buildSimulation,
};
