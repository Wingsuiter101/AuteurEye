import { motion, AnimatePresence } from 'framer-motion';
import { Video } from 'lucide-react';
import { useState, useEffect } from 'react';

const LoadingCamera = () => {
  const messages = [
    "Discovering auteurs...",
    "Analyzing movie patterns...",
    "Decoding cinematic signatures...",
    "Mapping directorial styles...",
    "Unveiling artistic fingerprints..."
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-auteur-bg">
      <div className="flex flex-col items-center gap-4">
        <motion.div 
          className="relative w-32 h-32"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Base grey camera */}
          <Video className="w-32 h-32 text-gray-400" />
          
          {/* Filling accent color */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="blur-[0.5px]">
              <Video className="w-32 h-32 text-auteur-accent" />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Loading Text */}
        <div className="h-8">
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentMessage}
              className="text-auteur-accent text-lg font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              {messages[currentMessage]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoadingCamera; 