import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Mail, Phone, User, ArrowRight } from 'lucide-react';

interface LeadCaptureProps {
  onSubmit: (data: { name: string; email: string; whatsapp: string }) => void;
  isLoading: boolean;
  progress: number;
}

export const LeadCapture = ({ onSubmit, isLoading, progress }: LeadCaptureProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, whatsapp });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <AnimatePresence mode="wait">
        {!showForm && progress < 70 && (
          <motion.div
            key="calculating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card rounded-3xl p-10 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-4">Analisando suas respostas...</h2>
            <p className="text-muted-foreground mb-8">
              Estamos calculando seu perfil personalizado
            </p>
            <div className="progress-bar h-3">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-4 text-primary font-semibold text-lg">{progress}%</p>
          </motion.div>
        )}

        {(showForm || progress >= 70) && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 md:p-10"
            onAnimationComplete={() => setShowForm(true)}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Seu resultado está pronto! 🎉</h2>
              <p className="text-muted-foreground">
                Preencha seus dados para ver seu perfil personalizado
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="input-glass h-14 pl-12 text-lg rounded-xl"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  required
                  className="input-glass h-14 pl-12 text-lg rounded-xl"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp (com DDD)"
                  required
                  className="input-glass h-14 pl-12 text-lg rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-all duration-300 glow-effect"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Ver meu resultado
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              🔒 Seus dados estão seguros e não serão compartilhados
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
