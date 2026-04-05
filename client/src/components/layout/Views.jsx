import React from 'react';
import { motion } from 'framer-motion';

export const ContextView = ({ children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: 'var(--spacing-xl)', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}
    >
      {children}
    </motion.div>
  );
};

export const FocusView = ({ children, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 5, 10, 0.95)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ width: '100%', maxWidth: '800px', background: 'var(--color-ui-bg-base)', borderRadius: 'var(--border-radius-l)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-elevation-lg)' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const SettingsView = ({ children }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xxl) 0' }}>
      {children}
    </div>
  );
};
