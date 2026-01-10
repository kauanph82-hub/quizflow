import { motion } from 'framer-motion';
import { Quiz, useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Play, 
  BarChart3, 
  Settings, 
  Trash2,
  Eye,
  Copy,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface QuizCardProps {
  quiz: Quiz;
  index: number;
}

export const QuizCard = ({ quiz, index }: QuizCardProps) => {
  const navigate = useNavigate();
  const { analytics, deleteQuiz } = useQuizStore();
  const quizAnalytics = analytics[quiz.id];

  const completionRate = quizAnalytics
    ? Math.round((quizAnalytics.completions / quizAnalytics.impressions) * 100) || 0
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      {/* Glassmorphism Card with Gradient Border */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-primary/50 via-cyan-400/30 to-primary/50 hover:from-primary/70 hover:via-cyan-400/50 hover:to-primary/70 transition-all duration-500">
        <div className="relative rounded-3xl bg-background/80 backdrop-blur-xl border border-white/10 p-6 h-full overflow-hidden">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                    {quiz.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
                  {quiz.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/10 rounded-xl backdrop-blur-sm"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                  <DropdownMenuItem onClick={() => navigate(`/quiz/${quiz.id}`)} className="rounded-xl">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/admin/quiz/${quiz.id}/edit`)} className="rounded-xl">
                    <Settings className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/quiz/${quiz.id}`)} className="rounded-xl">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={() => deleteQuiz(quiz.id)}
                    className="text-destructive focus:text-destructive rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Stats with Glassmorphism */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <p className="text-2xl font-bold text-foreground mb-1">
                  {quizAnalytics?.impressions || 0}
                </p>
                <p className="text-xs text-muted-foreground/70 font-medium">Visualizações</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-400/10 backdrop-blur-sm border border-primary/20 hover:from-primary/20 hover:to-cyan-400/20 transition-all duration-300"
              >
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent mb-1">
                  {completionRate}%
                </p>
                <p className="text-xs text-muted-foreground/70 font-medium">Conclusão</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <p className="text-2xl font-bold text-foreground mb-1">
                  {quizAnalytics?.leads || 0}
                </p>
                <p className="text-xs text-muted-foreground/70 font-medium">Leads</p>
              </motion.div>
            </div>

            {/* Meta Information */}
            <div className="flex items-center justify-between text-sm text-muted-foreground/70 mb-6 px-2">
              <span className="font-medium">{quiz.elements?.length || 0} elementos</span>
              <span className="font-medium">
                {new Date(quiz.createdAt).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 relative overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  <Play className="w-4 h-4 mr-2" />
                  Testar Quiz
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/quiz/${quiz.id}/analytics`)}
                  className="h-12 px-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
