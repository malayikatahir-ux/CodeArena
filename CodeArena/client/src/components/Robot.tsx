import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import robotImage from '@assets/generated_images/a_cute_futuristic_robot_mascot_for_a_coding_game.png';

interface RobotProps {
  message: string;
  emotion?: 'happy' | 'neutral' | 'sad' | 'thinking';
  speaking?: boolean;
}

export const Robot: React.FC<RobotProps> = ({ message, emotion = 'neutral', speaking = false }) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  
  // Typewriter effect for the bubble
  useEffect(() => {
    let i = 0;
    setDisplayedMessage('');
    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayedMessage(prev => prev + message.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [message]);

  // Speech Synthesis
  useEffect(() => {
    if (!message) return;
    
    // Cancel previous speech immediately
    window.speechSynthesis.cancel();

    // Slightly increased timeout to ensure browser TTS engine is ready
    const timeoutId = setTimeout(() => {
      // Check if speech is currently active to prevent collision
      if (window.speechSynthesis.speaking) {
         window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(message);
      
      const voices = window.speechSynthesis.getVoices();
      const robotVoice = voices.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Samantha') || 
        v.name.includes('Zira')
      ) || voices[0];
      
      if (robotVoice) utterance.voice = robotVoice;
      utterance.pitch = 1.1; 
      utterance.rate = 1.1; // Standard rate
      
      window.speechSynthesis.speak(utterance);
    }, 150); // Increased delay slightly

    return () => {
      clearTimeout(timeoutId);
      window.speechSynthesis.cancel();
    };
  }, [message]);

  return (
    <div className="relative flex flex-col items-center z-50 pointer-events-none">
      {/* Speech Bubble */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="mb-4 bg-card/90 backdrop-blur-md border-2 border-primary p-4 rounded-2xl rounded-bl-none max-w-xs shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <p className="text-foreground font-rajdhani font-medium text-lg leading-snug">
              {displayedMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot Image */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: speaking ? [0, 2, -2, 0] : 0
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 0.5 }
        }}
        className="relative w-48 h-48"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10" />
        <img 
          src={robotImage} 
          alt="CodeArena Robot" 
          className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
        />
      </motion.div>
    </div>
  );
};
