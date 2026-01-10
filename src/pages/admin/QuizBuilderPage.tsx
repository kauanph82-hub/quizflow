import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizStore, ElementType, QuizElement } from '@/store/quizStore';
import { ComponentPalette } from '@/components/builder/ComponentPalette';
import { FlowCanvas } from '@/components/builder/FlowCanvas';
import { ElementInspector } from '@/components/builder/ElementInspector';
import { DesignSystemPanel } from '@/components/builder/DesignSystemPanel';
import { PreviewModal } from '@/components/builder/PreviewModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings2,
  Layers
} from 'lucide-react';

const defaultElements: Record<ElementType, Omit<QuizElement, 'id'>> = {
  'welcome': { type: 'welcome', title: 'Bem-vindo!', description: 'Vamos começar?', required: false },
  'video-ask': { type: 'video-ask', title: 'Assista e responda', videoUrl: '', required: true },
  'multiple-choice': { type: 'multiple-choice', title: 'Nova pergunta', required: true, options: [{ id: '1', text: 'Opção A', points: 10 }, { id: '2', text: 'Opção B', points: 20 }] },
  'image-selection': { type: 'image-selection', title: 'Escolha uma imagem', required: true, options: [] },
  'range-slider': { type: 'range-slider', title: 'Avalie de 0 a 100', min: 0, max: 100, step: 10, required: true },
  'text-input': { type: 'text-input', title: 'Digite sua resposta', required: true },
  'lead-form': { type: 'lead-form', title: 'Seus dados', fields: ['name', 'email', 'whatsapp'], required: true },
  'countdown': { type: 'countdown', title: 'Tempo limitado!', duration: 60, required: false },
  'fake-loading': { type: 'fake-loading', title: 'Analisando...', loadingText: 'Processando suas respostas', pauseAt: 90, required: false },
  'result': { type: 'result', title: 'Seu Resultado', resultTitle: 'Parabéns!', required: false },
};

export const QuizBuilderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { 
    quizzes, 
    createQuiz, 
    updateQuiz,
    addElement,
    updateElement,
    deleteElement,
    reorderElements,
    duplicateElement,
    updateDesignSystem,
    updateTracking,
    selectedElementId,
    setSelectedElement,
  } = useQuizStore();

  const existingQuiz = id ? quizzes.find(q => q.id === id) : null;
  
  const [title, setTitle] = useState(existingQuiz?.title || '');
  const [showPreview, setShowPreview] = useState(false);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingType, setDraggingType] = useState<ElementType | null>(null);

  const [quizId, setQuizId] = useState<string | null>(existingQuiz?.id || null);

  useEffect(() => {
    if (!quizId && !existingQuiz) {
      const newQuiz = createQuiz({
        title: 'Novo Quiz',
        description: '',
        elements: [],
        resultRules: [],
        designSystem: {
          fontFamily: 'inter',
          primaryColor: 'hsl(174, 72%, 56%)',
          buttonRoundness: 12,
          glassmorphism: 60,
          darkMode: true,
        },
        tracking: { events: [] },
        isDraft: true,
      });
      setQuizId(newQuiz.id);
      setTitle(newQuiz.title);
    } else if (existingQuiz) {
      setQuizId(existingQuiz.id);
    }
  }, []);

  const quiz = quizzes.find(q => q.id === quizId);

  const handleAddElement = (type: ElementType) => {
    if (!quizId) return;
    addElement(quizId, defaultElements[type]);
  };

  const handleSave = () => {
    if (!quizId) return;
    updateQuiz(quizId, { title, isDraft: false });
    navigate('/admin');
  };

  const selectedElement = quiz?.elements.find(el => el.id === selectedElementId) || null;

  if (!quiz) return null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); updateQuiz(quizId!, { title: e.target.value }); }}
            className="w-64 h-9 input-glass font-semibold"
            placeholder="Nome do Quiz"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDesignPanel(!showDesignPanel)}
            className={`glass-button ${showDesignPanel ? 'bg-primary/20' : ''}`}
          >
            <Settings2 className="w-4 h-4 mr-1" />
            Design
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            className="glass-button"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-cyan-400"
          >
            <Save className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Component Palette */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 border-r border-border bg-card/40 flex-shrink-0"
        >
          <ComponentPalette
            onDragStart={(type) => { setDraggingType(type); setIsDragOver(true); }}
            onDragEnd={() => { setDraggingType(null); setIsDragOver(false); }}
            onAdd={handleAddElement}
          />
        </motion.div>

        {/* Column 2: Flow Canvas */}
        <div 
          className="flex-1 bg-background"
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={() => {
            if (draggingType) handleAddElement(draggingType);
            setDraggingType(null);
            setIsDragOver(false);
          }}
        >
          <FlowCanvas
            elements={quiz.elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElement}
            onReorder={(from, to) => reorderElements(quizId!, from, to)}
            onDuplicate={(id) => duplicateElement(quizId!, id)}
            onDelete={(id) => deleteElement(quizId!, id)}
            onAddElement={() => handleAddElement('multiple-choice')}
            isDragOver={isDragOver}
          />
        </div>

        {/* Column 3: Inspector or Design System Panel */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 border-l border-border bg-card/40 flex-shrink-0"
        >
          {showDesignPanel ? (
            <DesignSystemPanel
              designSystem={quiz.designSystem}
              tracking={quiz.tracking}
              onUpdateDesign={(updates) => updateDesignSystem(quizId!, updates)}
              onUpdateTracking={(updates) => updateTracking(quizId!, updates)}
            />
          ) : (
            <ElementInspector
              element={selectedElement}
              allElements={quiz.elements}
              onUpdate={(updates) => selectedElementId && updateElement(quizId!, selectedElementId, updates)}
              onClose={() => setSelectedElement(null)}
            />
          )}
        </motion.div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        quiz={quiz}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};
