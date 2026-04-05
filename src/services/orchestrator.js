function buildExecutions(payload, workflow, analysis) {
  const baseTime = Date.now();
  const actionDescriptors = {
    "Email sequence": `Personalized ${analysis.personalization.outreachChannel} response queued for ${payload.customerName}.`,
    "Sales notification": `Sales team notified with urgency score ${analysis.urgencyScore}.`,
    "CRM upsert": `Customer profile and qualification status synced to CRM.`,
    "Slack alert": `Operations alert posted with ${analysis.route.label.toLowerCase()} routing instructions.`,
    "Priority queue routing": `Ticket assigned to the high-priority queue for immediate triage.`,
    "Follow-up email": `Reassurance follow-up drafted using ${analysis.personalization.preferredTone} tone.`,
    "Success manager task": `Customer success owner assigned a retention outreach task.`,
    "Offer notification": `Retention offer decision prepared for approval and delivery.`,
    "CRM activity log": `Renewal risk activity logged for pipeline visibility.`,
  };

  return workflow.actions.map((action, index) => ({
    id: `${workflow.id}-action-${index + 1}`,
    action,
    system:
      action.includes("CRM")
        ? "CRM"
        : action.includes("Slack")
          ? "Slack"
          : action.includes("notification")
            ? "Notification Hub"
            : "Communication Service",
    status: "completed",
    timestamp: new Date(baseTime + index * 900).toISOString(),
    detail: actionDescriptors[action] || `${action} executed successfully.`,
  }));
}

function orchestrate(payload, workflow, analysis) {
  return {
    engine: "External orchestration engine",
    workflowVersion: "v2.4",
    branch: analysis.route.label,
    executions: buildExecutions(payload, workflow, analysis),
  };
}

module.exports = {
  orchestrate,
};
