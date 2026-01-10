import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz, useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizPlayerProps {
  quiz: Quiz;
  isPreview?: boolean;
}

export const QuizPlayer = ({ quiz, isPreview = false }: QuizPlayerProps) => {
  const [stage, setStage] = useState<'playing' | 'loading' | 'result'>('playing');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [leadData, setLeadData] = useState({ name: '', email: '', whatsapp: '' });

  const {
    currentElementIndex,
    currentAnswers,
    setAnswer,
    nextElement,
    prevElement,
    setCurrentQuiz,
    calculateFinalResult,
    saveLead,
    trackImpression,
    trackCompletion,
  } = useQuizStore();

  useEffect(() => {
    setCurrentQuiz(quiz);
    if (!isPreview) trackImpression(quiz.id);
  }, [quiz, setCurrentQuiz, trackImpression, isPreview]);

  const currentElement = quiz.elements[currentElementIndex];
  const isLastElement = currentElementIndex === quiz.elements.length - 1;
  const canProceed = currentElement && (
    !currentElement.required || 
    currentAnswers[currentElement.id] !== undefined ||
    currentElement.type === 'welcome' ||
    currentElement.type === 'fake-loading' ||
    currentElement.type === 'result'
  );

  const handleNext = () => {
    if (currentElement?.type === 'lead-form') {
      handleLeadSubmit();
    } else if (isLastElement || currentElement?.type === 'result') {
      const result = calculateFinalResult();
      if (result.redirect && !isPreview) {
        window.location.href = result.redirect;
      }
    } else {
      nextElement();
    }
  };

  const handleLeadSubmit = async () => {
    setStage('loading');
    let progress = 0;
    const pauseAt = currentElement?.pauseAt || 90;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= pauseAt) {
        progress = pauseAt;
        clearInterval(interval);
        
        setTimeout(() => {
          let p = pauseAt;
          const finalInterval = setInterval(() => {
            p += Math.random() * 5;
            if (p >= 100) {
              clearInterval(finalInterval);
              setLoadingProgress(100);
              
              if (!isPreview) {
                const result = calculateFinalResult();
                saveLead({
                  quizId: quiz.id,
                  ...leadData,
                  answers: currentAnswers,
                  score: result.score,
                  tags: result.tags,
                  profile: result.profile,
                  completed: true,
                  utmSource: new URLSearchParams(window.location.search).get('utm_source') || undefined,
                });
                trackCompletion(quiz.id);
              }
              
              setTimeout(() => {
                setStage('result');
              }, 500);
            }
            setLoadingProgress(Math.min(100, Math.round(p)));
          }, 100);
        }, 1500);
      }
      setLoadingProgress(Math.min(pauseAt, Math.round(progress)));
    }, 150);
  };

  const result = calculateFinalResult();

  return (
    <div className="min-h-full bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold text-center">{quiz.title}</h1>
        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${((currentElementIndex + 1) / quiz.elements.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {stage === 'playing' && currentElement && (
            <motion.div
              key={currentElement.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">{currentElement.title}</h2>
                {currentElement.description && (
                  <p className="text-muted-foreground">{currentElement.description}</p>
                )}
              </div>

              {/* Multiple Choice */}
              {(currentElement.type === 'multiple-choice' || currentElement.type === 'image-selection') && (
                <div className="space-y-3">
                  {currentElement.options?.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAnswer(currentElement.id, option.id, option.tags)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all",
                        currentAnswers[currentElement.id] === option.id
                          ? "bg-primary/20 border-primary"
                          : "bg-card/60 border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                          currentAnswers[currentElement.id] === option.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}>
                          {currentAnswers[currentElement.id] === option.id && (
                            <Check className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{option.text}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Range Slider */}
              {currentElement.type === 'range-slider' && (
                <div className="space-y-6">
                  <Slider
                    value={[Number(currentAnswers[currentElement.id]) || currentElement.min || 0]}
                    onValueChange={([value]) => setAnswer(currentElement.id, value)}
                    min={currentElement.min || 0}
                    max={currentElement.max || 100}
                    step={currentElement.step || 1}
                    className="py-4"
                  />
                  <div className="text-center text-2xl font-bold text-primary">
                    {currentAnswers[currentElement.id] || currentElement.min || 0}
                  </div>
                </div>
              )}

              {/* Text Input */}
              {currentElement.type === 'text-input' && (
                <Input
                  value={String(currentAnswers[currentElement.id] || '')}
                  onChange={(e) => setAnswer(currentElement.id, e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="input-glass h-12 text-lg"
                />
              )}

              {/* Lead Form */}
              {currentElement.type === 'lead-form' && (
                <div className="space-y-4">
                  <Input
                    value={leadData.name}
                    onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                    placeholder="Seu nome"
                    className="input-glass h-12"
                  />
                  <Input
                    type="email"
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    placeholder="Seu email"
                    className="input-glass h-12"
                  />
                  <Input
                    value={leadData.whatsapp}
                    onChange={(e) => setLeadData({ ...leadData, whatsapp: e.target.value })}
                    placeholder="WhatsApp"
                    className="input-glass h-12"
                  />
                </div>
              )}
            </motion.div>
          )}

          {stage === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <h2 className="text-xl font-semibold mb-4">Analisando suas respostas...</h2>
              <div className="w-64 mx-auto h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-cyan-400"
                  animate={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-2">{loadingProgress}%</p>
            </motion.div>
          )}

          {stage === 'result' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Seu Perfil: {result.profile}</h2>
              <p className="text-4xl font-bold text-primary mb-4">{result.score} pontos</p>
              {result.redirect && (
                <Button
                  onClick={() => !isPreview && (window.location.href = result.redirect!)}
                  className="bg-gradient-to-r from-primary to-cyan-400"
                >
                  Ver Minha Oferta Especial
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      {stage === 'playing' && (
        <footer className="p-4 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={prevElement}
              disabled={currentElementIndex === 0}
              className="glass-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-primary to-cyan-400"
            >
              {currentElement?.type === 'lead-form' ? 'Ver Resultado' : 'Próximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
};
