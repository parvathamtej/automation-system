import { motion } from 'framer-motion';
import ExecutionStepCard from './ExecutionStepCard';

const pipelineNodes = [
  { id: 'trigger', label: 'Trigger' },
  { id: 'ai', label: 'AI' },
  { id: 'decision', label: 'Decision' },
  { id: 'execution', label: 'Execution' },
  { id: 'output', label: 'Output' },
];

function resolveNodeState(index, revealCount) {
  if (index < revealCount) return 'active';
  if (index === revealCount) return 'current';
  return 'idle';
}

export default function PipelineVisualizer({ steps, revealCount }) {
  return (
    <div className="pipeline-visualizer">
      <div className="flow-path">
        {pipelineNodes.map((node, index) => (
          <div className={`flow-node is-${resolveNodeState(index, revealCount)}`} key={node.id}>
            <span>{node.label}</span>
          </div>
        ))}
      </div>

      <div className="step-stack">
        {steps.map((step, index) => {
          let status = 'pending';
          if (index < revealCount) {
            status = step.status === 'failed' ? 'failed' : step.status === 'warning' ? 'warning' : 'success';
          } else if (index === revealCount) {
            status = 'processing';
          }

          return (
            <motion.div
              key={step.id || `${step.stage}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.08, 0.4) }}
            >
              <ExecutionStepCard step={step} status={status} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
