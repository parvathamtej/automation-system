import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

export function Button({ variant = 'primary', size = 'm', className = '', children, ...props }) {
  return (
    <button className={`button button-${variant} button-${size} ${className}`.trim()} {...props}>
      <span className="button-ripple" />
      <span className="button-content">{children}</span>
    </button>
  );
}

export function MetricCard({ title, value, trend, trendValue, accentIndex = 0 }) {
  const accents = ['is-blue', 'is-violet', 'is-emerald'];
  const positive = trend === 'up';

  return (
    <motion.div className={`metric-card ${accents[accentIndex % accents.length]}`} whileHover={{ y: -4 }}>
      <span className="metric-kicker">{title}</span>
      <div className="metric-row">
        <strong>{value}</strong>
        <span className={`metric-chip ${positive ? 'is-positive' : 'is-negative'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendValue}
        </span>
      </div>
    </motion.div>
  );
}
