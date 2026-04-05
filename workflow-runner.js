const { workflowCatalog } = require('./src/data/workflows');
const { analyze } = require('./src/services/ai-engine');
const { executeActions } = require('./execution-layer');

function duration(startMs) {
  return Date.now() - startMs;
}

async function processWorkflow(payload) {
  const runStartedAt = Date.now();
  const workflow = workflowCatalog.find((item) => item.id === payload.workflowId);

  if (!workflow) {
    throw new Error(`Workflow "${payload.workflowId}" not found`);
  }

  const event = {
    source: payload.source || 'UI Form',
    customerName: payload.customerName || 'Unnamed Account',
    customerSegment: payload.customerSegment || 'General',
    message: payload.message || 'No message provided',
    channel: payload.channel || 'email',
    sentiment: payload.sentiment || 'neutral',
    email: payload.email || null,
    receivedAt: new Date().toISOString(),
  };

  const logs = [
    {
      timestamp: event.receivedAt,
      level: 'info',
      stage: 'Event Triggered',
      message: `Incoming ${workflow.name} event received from ${event.source}.`,
    },
  ];

  const aiStartedAt = Date.now();
  const analysis = analyze(event, workflow);
  const aiDurationMs = duration(aiStartedAt);
  const aiCompletedAt = new Date().toISOString();

  logs.push(
    {
      timestamp: new Date(aiStartedAt).toISOString(),
      level: 'info',
      stage: 'AI Analysis Started',
      message: `AI analysis started for ${event.customerName}.`,
    },
    {
      timestamp: aiCompletedAt,
      level: 'info',
      stage: 'Decision Route Selected',
      message: `${analysis.route.label} selected with urgency ${analysis.urgencyScore}/100.`,
    }
  );

  const executionStartedAt = Date.now();
  const executionReport = await executeActions(event, workflow, analysis);
  const executionDurationMs = duration(executionStartedAt);
  const completedAt = new Date().toISOString();

  logs.push(...executionReport.technicalLogs);

  const timeline = [
    {
      id: 'event-triggered',
      stage: 'Event Triggered',
      status: 'success',
      startedAt: event.receivedAt,
      completedAt: event.receivedAt,
      durationMs: 0,
      detail: `${event.source} submitted a new event for ${event.customerName}.`,
    },
    {
      id: 'ai-analysis-started',
      stage: 'AI Analysis Started',
      status: 'success',
      startedAt: new Date(aiStartedAt).toISOString(),
      completedAt: aiCompletedAt,
      durationMs: aiDurationMs,
      detail: `The reasoning engine analyzed sentiment, message intent, and workflow rules for ${workflow.name}.`,
    },
    {
      id: 'intent-classified',
      stage: 'Intent Classified',
      status: 'success',
      startedAt: aiCompletedAt,
      completedAt: aiCompletedAt,
      durationMs: 0,
      detail: `Intent "${analysis.intent}" detected with urgency ${analysis.urgencyScore}/100 and tone ${analysis.personalization.preferredTone}.`,
    },
    {
      id: 'decision-route-selected',
      stage: 'Decision Route Selected',
      status: 'success',
      startedAt: aiCompletedAt,
      completedAt: aiCompletedAt,
      durationMs: 0,
      detail: `${analysis.route.label} chosen because ${analysis.route.reason}`,
    },
    ...executionReport.results.map((execution, index) => ({
      id: `action-${index + 1}`,
      stage: `Action Execution: ${execution.system}`,
      status: execution.status === 'FAILED' ? 'failed' : execution.status === 'SKIPPED' ? 'warning' : 'success',
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      durationMs: execution.durationMs,
      detail: execution.detail,
      executionType: execution.type,
    })),
    {
      id: 'response-received',
      stage: 'Response Received',
      status: executionReport.results.some((item) => item.status === 'FAILED') ? 'failed' : 'success',
      startedAt: completedAt,
      completedAt,
      durationMs: 0,
      detail: `Backend completed ${executionReport.results.length} execution step(s) for ${workflow.name}.`,
    },
  ];

  return {
    success: true,
    workflow,
    event,
    analysis,
    orchestration: {
      engine: 'AI-Driven Execution Layer',
      branch: analysis.route.label,
      executions: executionReport.results,
    },
    timeline,
    metrics: {
      totalExecutionMs: duration(runStartedAt),
      aiProcessingMs: aiDurationMs,
      executionMs: executionDurationMs,
      stepsCompleted: timeline.length,
    },
    technicalLogs: {
      requestPayload: payload,
      normalizedEvent: event,
      analysis,
      executionLogs: logs,
      executions: executionReport.results,
    },
  };
}

module.exports = { processWorkflow };
