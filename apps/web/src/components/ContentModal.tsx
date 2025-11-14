import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Lightbulb, Star, Target } from 'lucide-react';
import { BlockContent, GameState } from '../types';
import soundManager from '../services/soundManager';

interface ContentModalProps {
  content: BlockContent | null;
  isOpen: boolean;
  onClose: () => void;
  onQuizAnswer?: (blockId: string, selectedAnswer: number) => Promise<void>;
  showQuiz?: boolean;
  gameState: GameState;
  blockId?: string;
}

const ContentModal: React.FC<ContentModalProps> = ({
  content,
  isOpen,
  onClose,
  onQuizAnswer,
  showQuiz,
  // gameState, // Unused parameter
  blockId,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      setIsCorrect(null);
      setShowExplanation(false);
    }
  }, [isOpen, content]);

  const handleAnswerSubmit = async () => {
    if (content?.question && selectedAnswer !== null && blockId && onQuizAnswer) {
      setQuizSubmitted(true);
      try {
        await onQuizAnswer(blockId, selectedAnswer);
        // Check if the answer is correct by comparing with the correct index
        const isAnswerCorrect = selectedAnswer === content.question.correctIndex;
        setIsCorrect(isAnswerCorrect);
        
        // Play appropriate sound based on answer
        if (isAnswerCorrect) {
          soundManager.playCorrectAnswer();
        } else {
          soundManager.playWrongAnswer();
        }
      } catch (error) {
        console.error('Error submitting quiz answer:', error);
        setIsCorrect(false);
        soundManager.playWrongAnswer();
      }
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  if (!isOpen || !content) return null;

  const isQuestion = content.type === 'QUESTION';
  const questionContent = content.question;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bitsacco-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                {isQuestion ? (
                  <Target className="w-8 h-8 text-yellow-400" />
                ) : (
                  <Lightbulb className="w-8 h-8 text-green-400" />
                )}
                <h2 className="text-2xl font-bold text-white">
                  {isQuestion ? 'Privacy Quiz' : 'Privacy Tip'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Learning Objective Section */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Learning Objective
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">{content.content}</p>
              </div>

              {/* Category and Difficulty */}
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                  <span className="text-blue-300 text-sm font-medium">
                    {content.category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full">
                  <span className="text-purple-300 text-sm font-medium">
                    {content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)}
                  </span>
                </div>
              </div>

              {/* Quiz Challenge Section */}
              {isQuestion && questionContent && showQuiz && (
                <div className="bg-gray-800/50 rounded-lg p-5 space-y-4 border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-semibold text-yellow-300">Quiz Challenge</h3>
                  </div>
                  <p className="text-yellow-100 font-medium text-lg">{questionContent.question}</p>
                  <div className="space-y-3">
                    {questionContent.options.map((option: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => !quizSubmitted && setSelectedAnswer(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium
                          ${quizSubmitted
                            ? (index === questionContent.correctIndex
                              ? 'border-green-500 bg-green-500/20 text-green-300'
                              : (index === selectedAnswer ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-gray-600 bg-gray-800 text-gray-300'))
                            : (selectedAnswer === index
                              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                              : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-yellow-500 hover:text-yellow-300')
                          }`}
                        disabled={quizSubmitted}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {!quizSubmitted && (
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={selectedAnswer === null}
                      className="bitsacco-btn bitsacco-btn-primary w-full mt-4"
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              )}

              {/* Quiz Result/Explanation */}
              {quizSubmitted && isQuestion && questionContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg space-y-3 ${isCorrect ? 'bg-green-700/30 border border-green-600' : 'bg-red-700/30 border border-red-600'}`}
                >
                  <h4 className="text-xl font-semibold flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </h4>
                  <p className="text-gray-300">{questionContent.explanation}</p>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-blue-400 hover:underline text-sm"
                  >
                    {showExplanation ? 'Hide Details' : 'Show More Details'}
                  </button>
                </motion.div>
              )}

              {/* Success Message for Tips */}
              {!isQuestion && (
                <div className="bg-green-700/30 border border-green-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-semibold">Great Learning!</span>
                  </div>
                  <p className="text-gray-300">
                    You&apos;ve learned an important privacy concept. Keep building your knowledge!
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button onClick={handleCloseModal} className="bitsacco-btn bitsacco-btn-secondary">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContentModal;
