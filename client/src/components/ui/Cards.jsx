import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

export function Button({
  variant = 'primary',
  size = 'm',
  children,
  className = '',
  ...props
}) {
  return (
    <button
      className={`button button-${variant} button-size-${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

const accents = [
  { glow: 'rgba(55, 91, 251, 0.16)' },
  { glow: 'rgba(15, 157, 88, 0.16)' },
  { glow: 'rgba(255, 156, 64, 0.2)' },
];

export function MetricCard({ title, value, trend, trendValue, accentIndex = 0 }) {
  const accent = accents[accentIndex % accents.length];
  const positive = trend === 'up';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="metric-card"
      style={{ boxShadow: `0 24px 48px -40px ${accent.glow}` }}
    >
      <span className="metric-label">{title}</span>
      <div className="metric-value-row">
        <strong className="metric-value">{value}</strong>
        {trendValue && (
          <span className={`metric-trend ${positive ? 'is-positive' : 'is-negative'}`}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
    </motion.div>
  );
}
