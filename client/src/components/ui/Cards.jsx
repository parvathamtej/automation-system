import React from 'react';
import classnames from 'classnames';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ variant = 'primary', size = 'm', className, children, ...props }, ref) => {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    borderRadius: 'var(--border-radius-m)', fontWeight: 600, border: '1px solid transparent',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
    outline: 'none', whiteSpace: 'nowrap'
  };

  const sizes = {
    s: { padding: '6px 12px', fontSize: 'var(--font-size-xs)' },
    m: { padding: '8px 16px', fontSize: 'var(--font-size-s)' },
    l: { padding: '12px 24px', fontSize: 'var(--font-size-m)' }
  };

  const variants = {
    primary: { background: 'var(--color-accent-primary)', color: '#fff', boxShadow: 'var(--shadow-elevation-sm)' },
    secondary: { background: 'var(--color-ui-bg-panel)', color: 'var(--color-text-main)', border: '1px solid var(--color-ui-border)', boxShadow: 'var(--shadow-elevation-sm)' },
    ghost: { background: 'transparent', color: 'var(--color-text-muted)' },
    danger: { background: 'var(--color-status-danger)', color: '#fff' }
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.98 }}
      style={{ ...baseStyle, ...sizes[size], ...variants[variant], ...props.style }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
});

export const MetricCard = ({ title, value, trend, trendValue }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2, boxShadow: 'var(--shadow-elevation-md)' }}
      style={{
        padding: 'var(--spacing-l)',
        background: 'var(--color-ui-bg-panel)',
        borderRadius: 'var(--border-radius-l)',
        boxShadow: 'var(--shadow-elevation-sm)',
        border: '1px solid var(--color-ui-border)',
        display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)',
        transition: 'all 0.3s'
      }}
    >
      <span style={{ fontSize: 'var(--font-size-s)', color: 'var(--color-text-muted)', fontWeight: 500 }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 800, letterSpacing: '-0.04em' }}>{value}</span>
        {trend && (
          <span style={{ fontSize: 'var(--font-size-s)', fontWeight: 600, color: trend === 'up' ? 'var(--color-status-success)' : 'var(--color-status-danger)' }}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export const ListingCard = ({ title, status, children, actions }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, boxShadow: 'var(--shadow-elevation-md)' }}
      style={{
        padding: 'var(--spacing-l)', background: 'var(--color-ui-bg-panel)',
        borderRadius: 'var(--border-radius-l)', boxShadow: 'var(--shadow-elevation-sm)',
        border: '1px solid var(--color-ui-border)',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-m)' }}>
        <h4 style={{ margin: 0, fontSize: 'var(--font-size-l)' }}>{title}</h4>
        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: 'var(--font-size-xs)', fontWeight: 700, 
          background: status === 'Active' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(234, 88, 12, 0.1)',
          color: status === 'Active' ? 'var(--color-status-success)' : 'var(--color-status-warning)'
        }}>
          {status}
        </span>
      </div>
      <div style={{ flex: 1, marginBottom: 'var(--spacing-m)', color: 'var(--color-text-muted)' }}>
        {children}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 'var(--spacing-s)', paddingTop: 'var(--spacing-m)', borderTop: '1px solid var(--color-ui-border)' }}>
          {actions}
        </div>
      )}
    </motion.div>
  );
};
