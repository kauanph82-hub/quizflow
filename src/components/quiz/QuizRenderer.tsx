import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz, useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Check, Sparkles, Mail, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDemoQuiz } from '@/hooks/useDemoQuiz';

interface QuizRendererProps {
  quiz: Quiz;
  isPreview?: boolean;
}

export const QuizRenderer = ({ quiz, isPreview = false }: QuizRendererProps) => {
  const [leadData, setLeadData] = useState({ name: '', email: '', whatsapp: '' });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveProgress, restoreProgress } = useDemoQuiz();

  const {
    currentElementIndex,
    currentAnswers,
    currentScore,
    currentTags,
    setAnswer,
    nextElement,
    prevElement,
    setCurrentQuiz,
    calculateFinalResult,
    saveLead,
    trackImpression,
    trackCompletion,
    goToElement,
  } = useQuizStore();

  useEffect(() => {
    setCurrentQuiz(quiz);
    if (!isPreview) {
      trackImpression(quiz.id);
      // Try to restore progress
      restoreProgress(quiz.id);
    }
  }, [quiz, setCurrentQuiz, trackImpression, isPreview, restoreProgress]);

  // Save progress whenever answers change
  useEffect(() => {
    if (!isPreview && Object.keys(currentAnswers).length > 0) {
      saveProgress(quiz.id, {
        currentElementIndex,
        answers: currentAnswers,
        leadData,
        score: currentScore,
        tags: currentTags,
      });
    }
  }, [currentAnswers, currentElementIndex, leadData, currentScore, currentTags, quiz.id, isPreview, saveProgress]);

  const currentElement = quiz.elements[currentElementIndex];
  const isLastElement = currentElementIndex === quiz.elements.length - 1;
  const canProceed = currentElement && (
    !currentElement.required || 
    currentAnswers[currentElement.id] !== undefined ||
    currentElement.type === 'welcome' ||
    currentElement.type === 'fake-loading' ||
    currentElement.type === 'result' ||
    (currentElement.type === 'lead-form' && leadData.name && leadData.email && leadData.whatsapp)
  );

  const handleNext = async () => {
    if (currentElement?.type === 'lead-form') {
      await handleLeadSubmit();
    } else if (currentElement?.type === 'fake-loading') {
      await handleFakeLoading();
    } else if (isLastElement || currentElement?.type === 'result') {
      const result = calculateFinalResult();
      if (result.redirect && !isPreview) {
        // Dispatch webhook before redirect
        await dispatchWebhook();
        window.location.href = result.redirect;
      }
    } else {
      nextElement();
    }
  };

  const handleLeadSubmit = async () => {
    setIsSubmitting(true);
    
    // Shadow Lead Capture - Save partial lead immediately
    if (!isPreview) {
      const partialLead = {
        quizId: quiz.id,
        ...leadData,
        answers: currentAnswers,
        score: currentScore,
        tags: currentTags,
        profile: 'Partial',
        completed: false,
        utmSource: new URLSearchParams(window.location.search).get('utm_source') || undefined,
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
        dropOffElement: currentElement.id,
      };
      saveLead(partialLead);
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    nextElement();
  };

  const handleFakeLoading = async () => {
    const duration = currentElement?.duration || 3000;
    const pauseAt = currentElement?.pauseAt || 90;
    
    let progress = 0;
    const increment = pauseAt / (duration * 0.7 / 100); // 70% of duration to reach pauseAt
    
    const interval = setInterval(() => {
      progress += increment;
      if (progress >= pauseAt) {
        progress = pauseAt;
        clearInterval(interval);
        
        // Pause at specified percentage
        setTimeout(() => {
          let finalProgress = pauseAt;
          const finalInterval = setInterval(() => {
            finalProgress += Math.random() * 5;
            if (finalProgress >= 100) {
              clearInterval(finalInterval);
              setLoadingProgress(100);
              
              // Complete the quiz and save final lead
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
                  utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
                  utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
                });
                trackCompletion(quiz.id);
              }
              
              setTimeout(() => {
                nextElement();
              }, 500);
            }
            setLoadingProgress(Math.min(100, Math.round(finalProgress)));
          }, 100);
        }, 1500);
      }
      setLoadingProgress(Math.min(pauseAt, Math.round(progress)));
    }, 100);
  };

  // Webhook dispatch function
  const dispatchWebhook = async () => {
    if (!quiz.tracking.webhookUrl || isPreview) return;

    try {
      const result = calculateFinalResult();
      const payload = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        lead: {
          ...leadData,
          score: result.score,
          tags: result.tags,
          profile: result.profile,
        },
        answers: currentAnswers,
        timestamp: new Date().toISOString(),
        utm: {
          source: new URLSearchParams(window.location.search).get('utm_source'),
          medium: new URLSearchParams(window.location.search).get('utm_medium'),
          campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        },
      };

      await fetch(quiz.tracking.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn('Webhook dispatch failed:', error);
    }
  };

  const result = calculateFinalResult();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header with Progress */}
      <header className="p-4 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-center mb-3">{quiz.title}</h1>
        <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-400 to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentElementIndex + 1) / quiz.elements.length) * 100}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {currentElementIndex + 1} de {quiz.elements.length}
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {currentElement && (
            <motion.div
              key={currentElement.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 200,
                opacity: { duration: 0.2 }
              }}
              className="w-full max-w-2xl"
            >
              {/* Welcome Screen */}
              {currentElement.type === 'welcome' && (
                <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/10" />
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="text-6xl mb-6"
                    >
                      🎯
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                      {currentElement.title}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                      {currentElement.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Multiple Choice & Image Selection */}
              {(currentElement.type === 'multiple-choice' || currentElement.type === 'image-selection') && (
                <div className="glass-card rounded-3xl p-8 md:p-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-3">{currentElement.title}</h2>
                    {currentElement.description && (
                      <p className="text-muted-foreground text-lg">{currentElement.description}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {currentElement.options?.map((option, index) => (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAnswer(currentElement.id, option.id, option.tags)}
                        className={cn(
                          "w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group",
                          currentAnswers[currentElement.id] === option.id
                            ? "bg-primary/20 border-primary shadow-lg shadow-primary/25"
                            : "bg-card/60 border-border hover:border-primary/50 hover:bg-card/80"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-4">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            currentAnswers[currentElement.id] === option.id
                              ? "border-primary bg-primary shadow-lg"
                              : "border-muted-foreground group-hover:border-primary/70"
                          )}>
                            {currentAnswers[currentElement.id] === option.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                              >
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </motion.div>
                            )}
                          </div>
                          <span className="font-medium text-lg">{option.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Range Slider */}
              {currentElement.type === 'range-slider' && (
                <div className="glass-card rounded-3xl p-8 md:p-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-3">{currentElement.title}</h2>
                    {currentElement.description && (
                      <p className="text-muted-foreground text-lg">{currentElement.description}</p>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className="px-4">
                      <Slider
                        value={[Number(currentAnswers[currentElement.id]) || currentElement.min || 0]}
                        onValueChange={([value]) => setAnswer(currentElement.id, value)}
                        min={currentElement.min || 0}
                        max={currentElement.max || 100}
                        step={currentElement.step || 1}
                        className="py-6"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {currentAnswers[currentElement.id] || currentElement.min || 0}
                      </div>
                      <div className="text-muted-foreground">
                        de {currentElement.min || 0} a {currentElement.max || 100}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Input */}
              {currentElement.type === 'text-input' && (
                <div className="glass-card rounded-3xl p-8 md:p-10">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-3">{currentElement.title}</h2>
                    {currentElement.description && (
                      <p className="text-muted-foreground text-lg">{currentElement.description}</p>
                    )}
                  </div>

                  <Input
                    value={String(currentAnswers[currentElement.id] || '')}
                    onChange={(e) => setAnswer(currentElement.id, e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="input-glass h-14 text-lg rounded-xl"
                  />
                </div>
              )}

              {/* Lead Form */}
              {currentElement.type === 'lead-form' && (
                <div className="glass-card rounded-3xl p-8 md:p-10">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl mb-4"
                    >
                      📱
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-3">{currentElement.title}</h2>
                    <p className="text-muted-foreground text-lg">{currentElement.description}</p>
                  </div>

                  <div className="space-y-5">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={leadData.name}
                        onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                        placeholder="Seu nome"
                        required
                        className="input-glass h-14 pl-12 text-lg rounded-xl"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={leadData.email}
                        onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                        placeholder="Seu melhor e-mail"
                        required
                        className="input-glass h-14 pl-12 text-lg rounded-xl"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={leadData.whatsapp}
                        onChange={(e) => setLeadData({ ...leadData, whatsapp: e.target.value })}
                        placeholder="WhatsApp (com DDD)"
                        required
                        className="input-glass h-14 pl-12 text-lg rounded-xl"
                      />
                    </div>
                  </div>

                  <p className="text-center text-xs text-muted-foreground mt-6">
                    🔒 Seus dados estão seguros e não serão compartilhados
                  </p>
                </div>
              )}

              {/* Fake Loading */}
              {currentElement.type === 'fake-loading' && (
                <div className="glass-card rounded-3xl p-8 md:p-10 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary to-cyan-400 flex items-center justify-center"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-4">{currentElement.title}</h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    {currentElement.description}
                  </p>
                  <div className="w-80 mx-auto h-3 bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary rounded-full relative"
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                  <p className="mt-4 text-primary font-semibold text-xl">{loadingProgress}%</p>
                  {currentElement.loadingText && (
                    <p className="text-muted-foreground mt-2">{currentElement.loadingText}</p>
                  )}
                </div>
              )}

              {/* Result */}
              {currentElement.type === 'result' && (
                <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/10" />
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', duration: 0.8 }}
                      className="text-6xl mb-6"
                    >
                      🎉
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                      Seu Perfil: {result.profile}
                    </h2>
                    <div className="text-5xl font-bold text-primary mb-6">{result.score} pontos</div>
                    <p className="text-lg text-muted-foreground mb-8">
                      Baseado nas suas respostas, criamos uma estratégia personalizada para você
                    </p>
                    {result.redirect && (
                      <Button
                        onClick={() => !isPreview && (window.location.href = result.redirect!)}
                        className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 h-14 px-8 text-lg font-semibold rounded-xl glow-effect"
                      >
                        Ver Minha Oferta Especial ✨
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      {currentElement && currentElement.type !== 'fake-loading' && currentElement.type !== 'result' && (
        <footer className="p-4 border-t border-border/50 backdrop-blur-sm bg-background/80">
          <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={prevElement}
              disabled={currentElementIndex === 0}
              className="glass-button h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 h-12 px-6 rounded-xl font-semibold glow-effect"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  {currentElement?.type === 'lead-form' ? 'Continuar' : 
                   isLastElement ? 'Ver Resultado' : 'Próximo'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
};