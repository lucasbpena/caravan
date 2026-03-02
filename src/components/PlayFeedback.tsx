import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FeedbackMessage = {
  id: string;
  message: string;
  x: number;
  y: number;
  type: 'error' | 'success';
};

type PlayFeedbackProps = {
  message: string | null;
  cursorPosition: { x: number; y: number } | null;
  type?: 'error' | 'success';
};

export function PlayFeedback({ message, cursorPosition, type = 'error' }: PlayFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    // Only create new feedback if message changed and we have a position
    if (message && cursorPosition && message !== lastMessageRef.current) {
      const newFeedback: FeedbackMessage = {
        id: crypto.randomUUID(),
        message,
        x: cursorPosition.x,
        y: cursorPosition.y,
        type,
      };
      
      setFeedback(newFeedback);
      lastMessageRef.current = message;

      // Auto-clear after animation completes
      const timeout = setTimeout(() => {
        setFeedback(null);
        lastMessageRef.current = null;
      }, 2000);

      return () => clearTimeout(timeout);
    }
    
    // Clear feedback if message is null
    if (!message) {
      lastMessageRef.current = null;
    }
  }, [message, cursorPosition, type]);

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={feedback.id}
          initial={{ 
            opacity: 0, 
            scale: 0.5,
            x: feedback.x,
            y: feedback.y,
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.1, 1, 0.8],
            y: feedback.y - 50,
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.2, 0.8, 1],
            ease: 'easeOut',
          }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className={`
            px-4 py-2 rounded-lg
            text-sm font-medium
            shadow-lg
            backdrop-blur-sm
            ${feedback.type === 'error' 
              ? 'bg-red-500/90 text-white border-2 border-red-300' 
              : 'bg-green-500/90 text-white border-2 border-green-300'
            }
          `}
        >
          {feedback.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}