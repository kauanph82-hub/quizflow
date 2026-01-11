import { useEffect, useState } from 'react';
import { useQuizStore } from '@/store/quizStore';

interface QuizProgress {
  quizId: string;
  currentElementIndex: number;
  answers: Record<string, string | number>;
  leadData: { name?: string; email?: string; whatsapp?: string };
  score: number;
  tags: string[];
  timestamp: number;
}

const STORAGE_KEY = 'quiz-progress';
const PROGRESS_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const useDemoQuiz = () => {
  const { quizzes, createQuiz, setCurrentQuiz, setAnswer, goToElement } = useQuizStore();
  const [isLoaded, setIsLoaded] = useState(false);

  // Save progress to localStorage
  const saveProgress = (quizId: string, progress: Partial<QuizProgress>) => {
    try {
      const existing = getProgress(quizId);
      const updated: QuizProgress = {
        quizId,
        currentElementIndex: 0,
        answers: {},
        leadData: {},
        score: 0,
        tags: [],
        timestamp: Date.now(),
        ...existing,
        ...progress,
      };
      localStorage.setItem(`${STORAGE_KEY}-${quizId}`, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save quiz progress:', error);
    }
  };

  // Get progress from localStorage
  const getProgress = (quizId: string): QuizProgress | null => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${quizId}`);
      if (!stored) return null;
      
      const progress: QuizProgress = JSON.parse(stored);
      
      // Check if progress is expired
      if (Date.now() - progress.timestamp > PROGRESS_EXPIRY) {
        clearProgress(quizId);
        return null;
      }
      
      return progress;
    } catch (error) {
      console.warn('Failed to load quiz progress:', error);
      return null;
    }
  };

  // Clear progress from localStorage
  const clearProgress = (quizId: string) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}-${quizId}`);
    } catch (error) {
      console.warn('Failed to clear quiz progress:', error);
    }
  };

  // Restore quiz progress
  const restoreProgress = (quizId: string) => {
    const progress = getProgress(quizId);
    if (!progress) return false;

    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return false;

    // Restore answers
    Object.entries(progress.answers).forEach(([elementId, answer]) => {
      setAnswer(elementId, answer);
    });

    // Restore position
    goToElement(progress.currentElementIndex);
    
    return true;
  };

  useEffect(() => {
    const initializeQuiz = async () => {
      // Only create demo quiz if no quizzes exist
      if (quizzes.length === 0) {
        try {
          const demoQuiz = await createQuiz({
            title: 'Descubra seu Perfil de Investidor',
            description: 'Responda 5 perguntas rápidas e descubra qual estratégia de investimento combina com você',
            slug: 'perfil-investidor-demo',
            isPublished: true,
            elements: [
              {
                id: 'welcome',
                type: 'welcome',
                title: '🎯 Descubra seu Perfil de Investidor',
                description: 'Em apenas 3 minutos, você vai descobrir qual estratégia de investimento combina perfeitamente com seu perfil e objetivos.',
                required: false,
              },
              {
                id: 'q1',
                type: 'multiple-choice',
                title: 'Qual é o seu principal objetivo financeiro?',
                description: 'Escolha a opção que mais se aproxima da sua realidade atual',
                required: true,
                options: [
                  { id: 'q1_a', text: 'Guardar dinheiro para emergências', points: 10, tags: ['conservador'] },
                  { id: 'q1_b', text: 'Comprar um imóvel ou carro', points: 20, tags: ['moderado'] },
                  { id: 'q1_c', text: 'Aposentadoria tranquila', points: 30, tags: ['moderado', 'longo-prazo'] },
                  { id: 'q1_d', text: 'Multiplicar meu patrimônio rapidamente', points: 40, tags: ['agressivo', 'empreendedor'] },
                ],
              },
              {
                id: 'q2',
                type: 'multiple-choice',
                title: 'Como você reagiria se seus investimentos caíssem 20% em um mês?',
                required: true,
                options: [
                  { id: 'q2_a', text: 'Ficaria muito preocupado e venderia tudo', points: 10, tags: ['conservador'] },
                  { id: 'q2_b', text: 'Ficaria ansioso mas manteria os investimentos', points: 20, tags: ['moderado'] },
                  { id: 'q2_c', text: 'Manteria a calma e esperaria a recuperação', points: 30, tags: ['moderado', 'experiente'] },
                  { id: 'q2_d', text: 'Aproveitaria para comprar mais', points: 40, tags: ['agressivo', 'experiente'] },
                ],
              },
              {
                id: 'lead-capture',
                type: 'lead-form',
                title: '📱 Quase lá! Vamos personalizar ainda mais',
                description: 'Para criar sua estratégia personalizada, precisamos de alguns dados básicos',
                required: true,
                fields: ['name', 'email', 'whatsapp'],
              },
              {
                id: 'q3',
                type: 'range-slider',
                title: 'De 0 a 100, quanto do seu patrimônio você aceitaria arriscar?',
                description: 'Considere que risco maior pode trazer retorno maior, mas também perdas maiores',
                required: true,
                min: 0,
                max: 100,
                step: 10,
                scoreWeight: 0.5,
              },
              {
                id: 'q4',
                type: 'multiple-choice',
                title: 'Há quanto tempo você investe ou acompanha o mercado?',
                required: true,
                options: [
                  { id: 'q4_a', text: 'Nunca investi, sou iniciante', points: 10, tags: ['iniciante'] },
                  { id: 'q4_b', text: 'Menos de 1 ano', points: 20, tags: ['iniciante'] },
                  { id: 'q4_c', text: '1 a 5 anos', points: 30, tags: ['intermediario'] },
                  { id: 'q4_d', text: 'Mais de 5 anos', points: 40, tags: ['experiente'] },
                ],
              },
              {
                id: 'q5',
                type: 'multiple-choice',
                title: 'Qual frase melhor descreve você?',
                required: true,
                options: [
                  { id: 'q5_a', text: 'Prefiro segurança mesmo ganhando menos', points: 10, tags: ['conservador'] },
                  { id: 'q5_b', text: 'Aceito um pouco de risco por retornos melhores', points: 20, tags: ['moderado'] },
                  { id: 'q5_c', text: 'Busco o equilíbrio entre risco e retorno', points: 30, tags: ['moderado'] },
                  { id: 'q5_d', text: 'Aceito altos riscos para altos ganhos', points: 40, tags: ['agressivo'] },
                ],
              },
              {
                id: 'fake-loading',
                type: 'fake-loading',
                title: 'Analisando seu perfil...',
                description: 'Estamos processando suas respostas para criar sua estratégia personalizada',
                required: false,
                loadingText: 'Calculando compatibilidade...',
                pauseAt: 85,
                duration: 3000,
              },
              {
                id: 'result',
                type: 'result',
                title: 'Seu Perfil Está Pronto!',
                description: 'Baseado nas suas respostas, criamos uma estratégia personalizada para você',
                required: false,
              },
            ],
            resultRules: [
              {
                id: 'rule1',
                condition: { type: 'score', minScore: 0, maxScore: 80 },
                title: 'Investidor Conservador',
                description: 'Você prioriza segurança e estabilidade nos seus investimentos',
                profile: 'Conservador',
                redirectUrl: 'https://exemplo.com/curso-conservador?price=197',
              },
              {
                id: 'rule2',
                condition: { type: 'score', minScore: 81, maxScore: 150 },
                title: 'Investidor Moderado',
                description: 'Você busca o equilíbrio entre segurança e rentabilidade',
                profile: 'Moderado',
                redirectUrl: 'https://exemplo.com/curso-moderado?price=497',
              },
              {
                id: 'rule3',
                condition: { type: 'score', minScore: 151, maxScore: 300 },
                title: 'Investidor Agressivo',
                description: 'Você está disposto a assumir riscos maiores por retornos superiores',
                profile: 'Agressivo',
                redirectUrl: 'https://exemplo.com/curso-agressivo?price=997',
              },
              {
                id: 'rule4',
                condition: { type: 'tags', requiredTags: ['empreendedor', 'agressivo'] },
                title: 'Empreendedor de Alto Impacto',
                description: 'Você tem perfil empreendedor e busca multiplicar patrimônio rapidamente',
                profile: 'Empreendedor Elite',
                redirectUrl: 'https://exemplo.com/mentoria-elite?price=2000',
              },
            ],
            designSystem: {
              fontFamily: 'inter',
              primaryColor: 'hsl(174, 72%, 56%)',
              buttonRoundness: 16,
              glassmorphism: 80,
              darkMode: true,
            },
            tracking: {
              facebookPixelId: '',
              webhookUrl: '',
              events: [
                { elementId: 'welcome', eventName: 'ViewContent', eventType: 'ViewContent' },
                { elementId: 'lead-capture', eventName: 'Lead', eventType: 'Lead' },
                { elementId: 'result', eventName: 'CompleteRegistration', eventType: 'Purchase' },
              ],
            },
            isDraft: false,
          });
          
          // Set as current quiz for immediate use
          if (demoQuiz) {
            setCurrentQuiz(demoQuiz);
          }
        } catch (error) {
          console.error('Failed to create demo quiz:', error);
        }
      }
      setIsLoaded(true);
    };

    initializeQuiz();
  }, [quizzes.length, createQuiz, setCurrentQuiz]);

  return {
    isLoaded,
    saveProgress,
    getProgress,
    clearProgress,
    restoreProgress,
  };
};
