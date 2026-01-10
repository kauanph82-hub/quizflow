import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Star, ExternalLink, Share2 } from 'lucide-react';

interface QuizResultProps {
  score: number;
  profile: string;
  redirectUrl?: string;
}

const profiles = [
  { minScore: 0, maxScore: 30, name: 'Iniciante', emoji: '🌱', color: 'from-green-400 to-emerald-500' },
  { minScore: 31, maxScore: 60, name: 'Intermediário', emoji: '⚡', color: 'from-yellow-400 to-orange-500' },
  { minScore: 61, maxScore: 80, name: 'Avançado', emoji: '🔥', color: 'from-orange-400 to-red-500' },
  { minScore: 81, maxScore: 100, name: 'Expert', emoji: '💎', color: 'from-purple-400 to-pink-500' },
];

export const QuizResult = ({ score, redirectUrl }: QuizResultProps) => {
  const profile = profiles.find((p) => score >= p.minScore && score <= p.maxScore) || profiles[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className={`absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-r ${profile.color} blur-3xl`}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 0.2 }}
            className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-gradient-to-r ${profile.color} blur-3xl`}
          />
        </div>

        <div className="relative z-10">
          {/* Trophy animation */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r ${profile.color} flex items-center justify-center shadow-2xl`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Profile name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-6xl">{profile.emoji}</span>
            <h2 className="text-3xl font-bold mt-4 mb-2">Você é {profile.name}!</h2>
            <p className="text-muted-foreground mb-6">
              Baseado nas suas respostas, identificamos seu perfil
            </p>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="mb-8"
          >
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${profile.color}`}>
              <Star className="w-5 h-5 text-white" />
              <span className="text-2xl font-bold text-white">{score} pontos</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            {redirectUrl && (
              <Button
                onClick={() => window.open(redirectUrl, '_blank')}
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                Ver oferta exclusiva
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigator.share?.({ title: 'Meu resultado', text: `Eu sou ${profile.name}!` })}
              className="w-full h-12 rounded-xl glass-button"
            >
              <Share2 className="mr-2 w-5 h-5" />
              Compartilhar resultado
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
