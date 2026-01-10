import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  GripVertical, 
  Plus, 
  ChevronRight,
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
  Copy,
  Trash2
} from 'lucide-react';
import { QuizElement, ElementType } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const elementIcons: Record<ElementType, React.ReactNode> = {
  'welcome': <Sparkles className="w-4 h-4" />,
  'video-ask': <Video className="w-4 h-4" />,
  'multiple-choice': <CheckSquare className="w-4 h-4" />,
  'image-selection': <Image className="w-4 h-4" />,
  'range-slider': <Sliders className="w-4 h-4" />,
  'text-input': <Type className="w-4 h-4" />,
  'lead-form': <User className="w-4 h-4" />,
  'countdown': <Timer className="w-4 h-4" />,
  'fake-loading': <Loader className="w-4 h-4" />,
  'result': <Trophy className="w-4 h-4" />,
};

const elementColors: Record<ElementType, string> = {
  'welcome': 'from-amber-500 to-orange-500',
  'video-ask': 'from-red-500 to-pink-500',
  'multiple-choice': 'from-blue-500 to-cyan-500',
  'image-selection': 'from-purple-500 to-violet-500',
  'range-slider': 'from-green-500 to-emerald-500',
  'text-input': 'from-slate-500 to-gray-500',
  'lead-form': 'from-primary to-cyan-400',
  'countdown': 'from-rose-500 to-red-500',
  'fake-loading': 'from-indigo-500 to-blue-500',
  'result': 'from-yellow-500 to-amber-500',
};

const elementLabels: Record<ElementType, string> = {
  'welcome': 'Boas-vindas',
  'video-ask': 'Vídeo',
  'multiple-choice': 'Múltipla Escolha',
  'image-selection': 'Seleção Visual',
  'range-slider': 'Escala',
  'text-input': 'Texto',
  'lead-form': 'Lead Form',
  'countdown': 'Contador',
  'fake-loading': 'Carregando',
  'result': 'Resultado',
};

interface FlowCanvasProps {
  elements: QuizElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddElement: () => void;
  isDragOver?: boolean;
}

export const FlowCanvas = ({
  elements,
  selectedElementId,
  onSelectElement,
  onReorder,
  onDuplicate,
  onDelete,
  onAddElement,
  isDragOver,
}: FlowCanvasProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Fluxo do Quiz</h2>
          <p className="text-xs text-muted-foreground mt-1">{elements.length} elementos</p>
        </div>
        <Button 
          size="sm" 
          onClick={onAddElement}
          className="h-8 px-3 bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground rounded-lg"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <div 
        className={cn(
          "flex-1 overflow-y-auto p-4 transition-colors duration-200",
          isDragOver && "bg-primary/5 ring-2 ring-inset ring-primary/20"
        )}
      >
        {elements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Canvas vazio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Arraste componentes ou clique para adicionar
              </p>
              <Button onClick={onAddElement} className="bg-gradient-to-r from-primary to-cyan-400">
                Começar a construir
              </Button>
            </div>
          </motion.div>
        ) : (
          <Reorder.Group
            axis="y"
            values={elements}
            onReorder={(newOrder) => {
              const oldIndex = elements.findIndex(e => e.id === newOrder[0]?.id);
              const newIndex = 0;
              if (oldIndex !== newIndex) {
                onReorder(oldIndex, newIndex);
              }
            }}
            className="space-y-2"
          >
            <AnimatePresence>
              {elements.map((element, index) => (
                <Reorder.Item
                  key={element.id}
                  value={element}
                  className="relative"
                  onDragEnd={(_, info) => {
                    const offset = Math.round(info.offset.y / 64);
                    if (offset !== 0) {
                      const newIndex = Math.max(0, Math.min(elements.length - 1, index + offset));
                      onReorder(index, newIndex);
                    }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onSelectElement(element.id)}
                    className={cn(
                      "group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                      selectedElementId === element.id
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                        : "bg-card/60 border-border hover:bg-secondary/50 hover:border-primary/30"
                    )}
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Step Number */}
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-gradient-to-br text-white shadow-lg",
                      elementColors[element.type]
                    )}>
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="text-muted-foreground">
                      {elementIcons[element.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">
                          {elementLabels[element.type]}
                        </span>
                        {element.nextElementId && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            Jump
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">
                        {element.title || 'Sem título'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(element.id); }}
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>

                    {/* Connection Line */}
                    {index < elements.length - 1 && (
                      <div className="absolute left-[44px] top-full w-0.5 h-2 bg-border" />
                    )}
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
};
