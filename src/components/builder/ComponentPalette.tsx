import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Video, 
  CheckSquare, 
  Image, 
  Sliders, 
  Type, 
  User, 
  Timer, 
  Loader, 
  Trophy,
  GripVertical
} from 'lucide-react';
import { ElementType } from '@/store/quizStore';

interface ComponentItem {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const components: ComponentItem[] = [
  { 
    type: 'welcome', 
    label: 'Boas-vindas', 
    icon: <Sparkles className="w-5 h-5" />, 
    description: 'Tela inicial com título',
    color: 'from-amber-500 to-orange-500'
  },
  { 
    type: 'video-ask', 
    label: 'Vídeo', 
    icon: <Video className="w-5 h-5" />, 
    description: 'Pergunta com vídeo',
    color: 'from-red-500 to-pink-500'
  },
  { 
    type: 'multiple-choice', 
    label: 'Múltipla Escolha', 
    icon: <CheckSquare className="w-5 h-5" />, 
    description: 'Opções de texto',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    type: 'image-selection', 
    label: 'Seleção Visual', 
    icon: <Image className="w-5 h-5" />, 
    description: 'Opções com imagens',
    color: 'from-purple-500 to-violet-500'
  },
  { 
    type: 'range-slider', 
    label: 'Escala', 
    icon: <Sliders className="w-5 h-5" />, 
    description: 'Slider de 0 a 100',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    type: 'text-input', 
    label: 'Texto Livre', 
    icon: <Type className="w-5 h-5" />, 
    description: 'Campo de texto',
    color: 'from-slate-500 to-gray-500'
  },
  { 
    type: 'lead-form', 
    label: 'Captura de Lead', 
    icon: <User className="w-5 h-5" />, 
    description: 'Nome, email, WhatsApp',
    color: 'from-primary to-cyan-400'
  },
  { 
    type: 'countdown', 
    label: 'Contador', 
    icon: <Timer className="w-5 h-5" />, 
    description: 'Timer de urgência',
    color: 'from-rose-500 to-red-500'
  },
  { 
    type: 'fake-loading', 
    label: 'Carregando', 
    icon: <Loader className="w-5 h-5" />, 
    description: 'Animação de análise',
    color: 'from-indigo-500 to-blue-500'
  },
  { 
    type: 'result', 
    label: 'Resultado', 
    icon: <Trophy className="w-5 h-5" />, 
    description: 'Tela final + redirect',
    color: 'from-yellow-500 to-amber-500'
  },
];

interface ComponentPaletteProps {
  onDragStart: (type: ElementType) => void;
  onDragEnd: () => void;
  onAdd: (type: ElementType) => void;
}

export const ComponentPalette = ({ onDragStart, onDragEnd, onAdd }: ComponentPaletteProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Componentes</h2>
        <p className="text-xs text-muted-foreground mt-1">Arraste para o canvas</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {components.map((component, index) => (
          <motion.div
            key={component.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            draggable
            onDragStart={() => onDragStart(component.type)}
            onDragEnd={onDragEnd}
            onClick={() => onAdd(component.type)}
            className="group relative flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/50 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all duration-200"
          >
            <div className={`p-2 rounded-lg bg-gradient-to-br ${component.color} text-white shadow-lg`}>
              {component.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{component.label}</p>
              <p className="text-xs text-muted-foreground truncate">{component.description}</p>
            </div>
            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
