import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDemoQuiz } from '@/hooks/useDemoQuiz';

const Index = () => {
  const navigate = useNavigate();
  
  // Initialize demo quiz on first load
  useDemoQuiz();

  const features = [
    {
      icon: Sparkles,
      title: 'Quizzes Gamificados',
      description: 'Engaje visitantes com perguntas interativas e resultados personalizados',
    },
    {
      icon: Zap,
      title: 'Branching Condicional',
      description: 'Crie fluxos dinâmicos baseados nas respostas do usuário',
    },
    {
      icon: BarChart3,
      title: 'Analytics em Tempo Real',
      description: 'Acompanhe conversões, taxa de conclusão e performance',
    },
    {
      icon: Users,
      title: 'Captura de Leads',
      description: 'Colete nome, email e WhatsApp de forma elegante',
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-cyan-400">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">XQuiz</span>
        </div>
        <Button
          onClick={() => navigate('/admin')}
          variant="outline"
          className="glass-button rounded-xl"
        >
          Acessar Admin
        </Button>
      </header>

      {/* Hero */}
      <main className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Quiz Funnel Platform</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transforme visitantes em{' '}
            <span className="gradient-text">leads qualificados</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Crie quizzes interativos que engajam seu público, capturam informações
            e direcionam para ofertas personalizadas automaticamente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/admin/quiz/new')}
              className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 glow-effect"
            >
              Criar meu quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="h-14 px-8 text-lg rounded-xl glass-button"
            >
              Ver dashboard
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass-card rounded-2xl p-6 hover-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary/20 to-cyan-400/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-24"
        >
          <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Crie seu primeiro quiz em minutos e comece a capturar leads qualificados hoje mesmo.
              </p>
              <Button
                onClick={() => navigate('/admin/quiz/new')}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Criar quiz agora
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 XQuiz. Plataforma de Quiz Funnels.
        </p>
      </footer>
    </div>
  );
};

export default Index;
