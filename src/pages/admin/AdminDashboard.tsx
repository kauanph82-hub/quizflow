import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/store/quizStore';
import { QuizCard } from '@/components/admin/QuizCard';
import { StatsCard } from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Eye, 
  MousePointerClick, 
  Users, 
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { quizzes, leads, analytics } = useQuizStore();

  // Calculate total stats
  const totalImpressions = Object.values(analytics).reduce((acc, a) => acc + a.impressions, 0);
  const totalCompletions = Object.values(analytics).reduce((acc, a) => acc + a.completions, 0);
  const totalLeads = leads.length;
  const avgCompletionRate = totalImpressions > 0 
    ? Math.round((totalCompletions / totalImpressions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-cyan-400">
              <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">XQuiz Admin</h1>
              <p className="text-sm text-muted-foreground">Gerencie seus quizzes</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin/quiz/new')}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 glow-effect"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Quiz
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Visão geral</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Visualizações"
              value={totalImpressions.toLocaleString()}
              change="+12%"
              changeType="positive"
              icon={Eye}
              index={0}
            />
            <StatsCard
              title="Taxa de conclusão"
              value={`${avgCompletionRate}%`}
              change="+5%"
              changeType="positive"
              icon={MousePointerClick}
              index={1}
            />
            <StatsCard
              title="Leads capturados"
              value={totalLeads.toLocaleString()}
              change="+23"
              changeType="positive"
              icon={Users}
              index={2}
            />
            <StatsCard
              title="Quizzes ativos"
              value={quizzes.length}
              icon={TrendingUp}
              index={3}
            />
          </div>
        </section>

        {/* Quizzes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Seus quizzes</h2>
          </div>

          {quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary/20 to-cyan-400/20 flex items-center justify-center">
                <Plus className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Crie seu primeiro quiz</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Transforme visitantes em leads qualificados com quizzes interativos e gamificados
              </p>
              <Button
                onClick={() => navigate('/admin/quiz/new')}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 glow-effect"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar quiz
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <QuizCard key={quiz.id} quiz={quiz} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
