import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { X, Smartphone, Monitor, RotateCcw } from 'lucide-react';
import { QuizPlayer } from '@/components/player/QuizPlayer';

interface PreviewModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal = ({ quiz, isOpen, onClose }: PreviewModalProps) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [key, setKey] = useState(0);

  const resetPreview = () => {
    setKey((k) => k + 1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl h-[90vh] bg-card rounded-2xl border border-border overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Preview do Quiz</h2>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
                <Button
                  variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
                <Button
                  variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetPreview}
                className="glass-button"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Resetar
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8 bg-secondary/20">
            <div
              className={`h-full bg-background rounded-2xl border border-border overflow-hidden shadow-2xl transition-all duration-300 ${
                viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
              }`}
            >
              <QuizPlayer key={key} quiz={quiz} isPreview />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
