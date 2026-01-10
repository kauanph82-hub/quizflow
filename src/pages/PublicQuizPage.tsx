import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { QuizRenderer } from '@/components/quiz/QuizRenderer';
import { Quiz } from '@/store/quizStore';

export const PublicQuizPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!slug) {
        setError('Slug do quiz não encontrado');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/public/quiz/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Quiz não encontrado');
          } else {
            setError('Erro ao carregar quiz');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setQuiz(data.quiz);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Erro de conexão');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-cyan-400 animate-spin">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Carregando quiz...</h2>
          <p className="text-muted-foreground">
            Preparando sua experiência personalizada
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-12 text-center max-w-md"
        >
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold mb-4">
            {error === 'Quiz não encontrado' ? 'Quiz não encontrado' : 'Ops! Algo deu errado'}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {error === 'Quiz não encontrado' 
              ? 'Este quiz pode ter sido removido ou o link está incorreto.'
              : 'Não foi possível carregar o quiz. Tente novamente em alguns instantes.'
            }
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 h-12 px-6 rounded-xl font-semibold glow-effect"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </motion.div>
      </div>
    );
  }

  return <QuizRenderer quiz={quiz} />;
};