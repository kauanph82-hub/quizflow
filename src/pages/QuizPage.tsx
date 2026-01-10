import { useParams } from 'react-router-dom';
import { useQuizStore } from '@/store/quizStore';
import { QuizRenderer } from '@/components/quiz/QuizRenderer';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDemoQuiz } from '@/hooks/useDemoQuiz';

export const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quizzes } = useQuizStore();
  const { isLoaded } = useDemoQuiz();
  
  const quiz = quizzes.find((q) => q.id === quizId);

  if (!isLoaded) {
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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-12 text-center max-w-md"
        >
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold mb-4">Quiz não encontrado</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Este quiz pode ter sido removido ou o link está incorreto. Que tal criar um novo?
          </p>
          <Button
            onClick={() => navigate('/admin')}
            className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 h-12 px-6 rounded-xl font-semibold glow-effect"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao painel
          </Button>
        </motion.div>
      </div>
    );
  }

  return <QuizRenderer quiz={quiz} />;
};
