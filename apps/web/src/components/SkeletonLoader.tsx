import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'canvas' | 'card' | 'text' | 'button' | 'tower';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card',
  className = '' 
}) => {
  if (variant === 'canvas') {
    return (
      <div className={`relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Loading Tower Animation */}
            <div className="relative w-32 h-48 mx-auto mb-6">
              {[0, 1, 2, 3, 4, 5].map((layer) => (
                <motion.div
                  key={layer}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: layer * 0.1, duration: 0.3 }}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                  style={{ bottom: `${layer * 32}px` }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((block) => (
                      <motion.div
                        key={block}
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          scale: [0.95, 1, 0.95],
                        }}
                        transition={{
                          duration: 2,
                          delay: block * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-8 h-6 bg-gradient-to-br from-teal-500 to-teal-700 rounded-sm"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Loading Text */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-teal-400 font-semibold text-lg mb-2"
            >
              Building Tower...
            </motion.div>
            
            {/* Progress Dots */}
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    delay: dot * 0.2,
                    repeat: Infinity,
                  }}
                  className="w-2 h-2 bg-teal-500 rounded-full"
                />
              ))}
            </div>

            {/* Loading Tip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-sm mt-4 max-w-xs"
            >
              💡 Tip: Use pinch gestures to zoom on mobile
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === 'tower') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-24 h-32">
          {[0, 1, 2, 3].map((layer) => (
            <motion.div
              key={layer}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.3, 0.6, 0.3], y: 0 }}
              transition={{
                opacity: { duration: 1.5, repeat: Infinity, delay: layer * 0.1 },
                y: { duration: 0.3 }
              }}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-700 rounded-sm"
              style={{ bottom: `${layer * 20}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`animate-pulse space-y-2 ${className}`}>
        <div className="h-3 bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-700 rounded w-4/5"></div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`animate-pulse h-12 bg-gray-700 rounded-lg ${className}`}></div>
    );
  }

  return null;
};

export default SkeletonLoader;
