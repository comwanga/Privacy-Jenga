import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hand, Maximize2, RotateCw, Target, CheckCircle } from 'lucide-react';

interface MobileGestureTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const MobileGestureTutorial: React.FC<MobileGestureTutorialProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      icon: Hand,
      title: 'Welcome to Privacy Jenga!',
      description: 'Learn how to play on mobile with simple gestures',
      animation: 'wave',
      gesture: null,
    },
    {
      icon: Target,
      title: 'Tap to Select',
      description: 'Tap on any block to select and view its content',
      animation: 'tap',
      gesture: 'tap',
    },
    {
      icon: RotateCw,
      title: 'Drag to Rotate',
      description: 'Swipe left or right to rotate the tower and see all angles',
      animation: 'swipe',
      gesture: 'swipe',
    },
    {
      icon: Maximize2,
      title: 'Pinch to Zoom',
      description: 'Use two fingers to zoom in and out for a closer look',
      animation: 'pinch',
      gesture: 'pinch',
    },
    {
      icon: CheckCircle,
      title: 'You\'re Ready!',
      description: 'Start playing and learn privacy concepts while having fun',
      animation: 'success',
      gesture: null,
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    // Auto-advance on last step after 2 seconds
    if (currentStep === steps.length - 1) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const renderGestureAnimation = () => {
    const { animation } = currentStepData;

    if (animation === 'tap') {
      return (
        <div className="relative w-48 h-48 mx-auto">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-32 h-32 bg-teal-500/20 rounded-lg border-2 border-teal-400" />
          </motion.div>
          <motion.div
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-teal-500 rounded-full" />
            </div>
          </motion.div>
        </div>
      );
    }

    if (animation === 'swipe') {
      return (
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-purple-500/20 rounded-lg border-2 border-purple-400" />
          </div>
          <motion.div
            animate={{
              x: [-40, 40, -40],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
            </div>
          </motion.div>
          <motion.div
            animate={{
              opacity: [0, 1, 1, 0],
              pathLength: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <svg width="100" height="4" className="stroke-purple-400" strokeWidth="2" fill="none">
              <motion.line
                x1="0"
                y1="2"
                x2="100"
                y2="2"
                strokeDasharray="5,5"
                animate={{
                  strokeDashoffset: [0, -10],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </svg>
          </motion.div>
        </div>
      );
    }

    if (animation === 'pinch') {
      return (
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-32 h-32 bg-blue-500/20 rounded-lg border-2 border-blue-400"
            />
          </div>
          <motion.div
            animate={{
              x: [-10, -20, -10],
              y: [-10, -20, -10],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/3 left-1/3"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          </motion.div>
          <motion.div
            animate={{
              x: [10, 20, 10],
              y: [10, 20, 10],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/3 right-1/3"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
          </motion.div>
        </div>
      );
    }

    if (animation === 'success') {
      return (
        <div className="relative w-48 h-48 mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <CheckCircle className="w-32 h-32 text-green-400" />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-32 h-32 border-4 border-green-400 rounded-full opacity-20" />
          </motion.div>
        </div>
      );
    }

    // Default wave animation
    return (
      <div className="relative w-48 h-48 mx-auto">
        <motion.div
          animate={{
            rotate: [0, 14, -8, 14, -4, 10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Hand className="w-32 h-32 text-teal-400" />
        </motion.div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <currentStepData.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Animation */}
            {renderGestureAnimation()}

            {/* Title & Description */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {currentStepData.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-900/50 flex justify-between items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Step Indicators */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-teal-400 w-6'
                      : index < currentStep
                      ? 'bg-teal-600'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all"
            >
              {currentStep === steps.length - 1 ? 'Start Playing' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileGestureTutorial;
