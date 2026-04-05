import { AnimatePresence, motion } from 'framer-motion';

export function ContextView({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="context-view"
    >
      {children}
    </motion.div>
  );
}

export function FocusView({ children, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="focus-backdrop"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose?.();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="focus-panel"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
