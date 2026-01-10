import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizElement, QuizOption, ElementType } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Settings2, 
  Palette, 
  Zap,
  X,
  GripVertical
} from 'lucide-react';

interface ElementInspectorProps {
  element: QuizElement | null;
  allElements: QuizElement[];
  onUpdate: (updates: Partial<QuizElement>) => void;
  onClose: () => void;
}

export const ElementInspector = ({
  element,
  allElements,
  onUpdate,
  onClose,
}: ElementInspectorProps) => {
  const [activeTab, setActiveTab] = useState('content');

  if (!element) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Settings2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">Inspetor</h3>
          <p className="text-sm text-muted-foreground">
            Selecione um elemento para editar suas propriedades
          </p>
        </div>
      </div>
    );
  }

  const addOption = () => {
    const newOption: QuizOption = {
      id: Math.random().toString(36).substring(2, 15),
      text: '',
      points: 0,
    };
    onUpdate({ options: [...(element.options || []), newOption] });
  };

  const updateOption = (optionId: string, updates: Partial<QuizOption>) => {
    onUpdate({
      options: element.options?.map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  const deleteOption = (optionId: string) => {
    onUpdate({
      options: element.options?.filter((opt) => opt.id !== optionId),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Propriedades</h2>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {element.type.replace('-', ' ')}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-3 glass-card p-1 rounded-lg">
          <TabsTrigger value="content" className="rounded-md text-xs">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="logic" className="rounded-md text-xs">
            Lógica
          </TabsTrigger>
          <TabsTrigger value="style" className="rounded-md text-xs">
            Estilo
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Content Tab */}
          <TabsContent value="content" className="p-4 space-y-6 mt-0">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Título</Label>
              <Input
                value={element.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Digite o título..."
                className="input-glass"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Descrição</Label>
              <Textarea
                value={element.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Adicione uma descrição..."
                className="input-glass min-h-[80px]"
              />
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
              <div>
                <Label className="text-sm font-medium">Obrigatório</Label>
                <p className="text-xs text-muted-foreground">Usuário deve responder</p>
              </div>
              <Switch
                checked={element.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>

            {/* Video URL for video-ask */}
            {element.type === 'video-ask' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">URL do Vídeo</Label>
                <Input
                  value={element.videoUrl || ''}
                  onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="input-glass"
                />
              </div>
            )}

            {/* Options for multiple-choice and image-selection */}
            {(element.type === 'multiple-choice' || element.type === 'image-selection') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Opções de Resposta</Label>
                  <Button size="sm" onClick={addOption} className="h-7 text-xs glass-button">
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>

                <AnimatePresence>
                  {element.options?.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-xl bg-secondary/30 border border-border space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <span className="text-xs font-bold text-primary w-5">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(option.id, { text: e.target.value })}
                          placeholder="Texto da opção"
                          className="input-glass flex-1 h-8 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteOption(option.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Pontos</Label>
                          <Input
                            type="number"
                            value={option.points}
                            onChange={(e) => updateOption(option.id, { points: parseInt(e.target.value) || 0 })}
                            className="input-glass h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Jump</Label>
                          <Select
                            value={option.nextElementId || 'next'}
                            onValueChange={(value) => updateOption(option.id, {
                              nextElementId: value === 'next' ? undefined : value
                            })}
                          >
                            <SelectTrigger className="input-glass h-8 text-sm">
                              <SelectValue placeholder="Próximo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="next">Próximo</SelectItem>
                              {allElements
                                .filter((el) => el.id !== element.id)
                                .map((el, i) => (
                                  <SelectItem key={el.id} value={el.id}>
                                    {i + 1}. {el.title?.substring(0, 20) || el.type}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {element.type === 'image-selection' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs glass-button"
                          onClick={() => {
                            const url = prompt('URL da imagem:');
                            if (url) updateOption(option.id, { imageUrl: url });
                          }}
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1" />
                          {option.imageUrl ? 'Trocar imagem' : 'Adicionar imagem'}
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Range Slider Settings */}
            {element.type === 'range-slider' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Mínimo</Label>
                    <Input
                      type="number"
                      value={element.min || 0}
                      onChange={(e) => onUpdate({ min: parseInt(e.target.value) || 0 })}
                      className="input-glass h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Máximo</Label>
                    <Input
                      type="number"
                      value={element.max || 100}
                      onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 100 })}
                      className="input-glass h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Passo</Label>
                    <Input
                      type="number"
                      value={element.step || 1}
                      onChange={(e) => onUpdate({ step: parseInt(e.target.value) || 1 })}
                      className="input-glass h-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Peso do Score</Label>
                  <Input
                    type="number"
                    value={element.scoreWeight || 1}
                    onChange={(e) => onUpdate({ scoreWeight: parseFloat(e.target.value) || 1 })}
                    className="input-glass"
                  />
                </div>
              </div>
            )}

            {/* Lead Form Fields */}
            {element.type === 'lead-form' && (
              <div className="space-y-3">
                <Label className="text-xs font-medium">Campos do Formulário</Label>
                {(['name', 'email', 'whatsapp'] as const).map((field) => (
                  <div
                    key={field}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                  >
                    <span className="text-sm capitalize">{field === 'whatsapp' ? 'WhatsApp' : field === 'name' ? 'Nome' : 'Email'}</span>
                    <Switch
                      checked={element.fields?.includes(field) ?? true}
                      onCheckedChange={(checked) => {
                        const currentFields = element.fields || ['name', 'email', 'whatsapp'];
                        const newFields = checked
                          ? [...currentFields, field]
                          : currentFields.filter((f) => f !== field);
                        onUpdate({ fields: newFields });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Countdown Settings */}
            {element.type === 'countdown' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Duração (segundos)</Label>
                <Input
                  type="number"
                  value={element.duration || 60}
                  onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 60 })}
                  className="input-glass"
                />
              </div>
            )}

            {/* Fake Loading Settings */}
            {element.type === 'fake-loading' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Texto de Loading</Label>
                  <Input
                    value={element.loadingText || 'Analisando suas respostas...'}
                    onChange={(e) => onUpdate({ loadingText: e.target.value })}
                    className="input-glass"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Pausar em (%)</Label>
                  <Slider
                    value={[element.pauseAt || 90]}
                    onValueChange={([value]) => onUpdate({ pauseAt: value })}
                    max={99}
                    min={50}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {element.pauseAt || 90}%
                  </p>
                </div>
              </div>
            )}

            {/* Result Settings */}
            {element.type === 'result' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Título do Resultado</Label>
                  <Input
                    value={element.resultTitle || ''}
                    onChange={(e) => onUpdate({ resultTitle: e.target.value })}
                    placeholder="Parabéns! Seu perfil é..."
                    className="input-glass"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Descrição</Label>
                  <Textarea
                    value={element.resultDescription || ''}
                    onChange={(e) => onUpdate({ resultDescription: e.target.value })}
                    placeholder="Descrição personalizada do resultado..."
                    className="input-glass min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">URL de Redirecionamento</Label>
                  <Input
                    value={element.redirectUrl || ''}
                    onChange={(e) => onUpdate({ redirectUrl: e.target.value })}
                    placeholder="https://..."
                    className="input-glass"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Logic Tab */}
          <TabsContent value="logic" className="p-4 space-y-6 mt-0">
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Próximo Elemento (Padrão)
              </Label>
              <Select
                value={element.nextElementId || 'next'}
                onValueChange={(value) => onUpdate({
                  nextElementId: value === 'next' ? undefined : value
                })}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Próximo na sequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Próximo na sequência</SelectItem>
                  {allElements
                    .filter((el) => el.id !== element.id)
                    .map((el, i) => (
                      <SelectItem key={el.id} value={el.id}>
                        {i + 1}. {el.title?.substring(0, 25) || el.type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define para onde ir após esta etapa
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Evento de Pixel</Label>
              <Select
                value={element.pixelEvent || 'none'}
                onValueChange={(value) => onUpdate({
                  pixelEvent: value === 'none' ? undefined : value
                })}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Nenhum evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum evento</SelectItem>
                  <SelectItem value="ViewContent">ViewContent</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                  <SelectItem value="InitiateCheckout">InitiateCheckout</SelectItem>
                  <SelectItem value="AddToCart">AddToCart</SelectItem>
                  <SelectItem value="CompleteRegistration">CompleteRegistration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="p-4 space-y-6 mt-0">
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-primary" />
                Background
              </Label>
              <Input
                value={element.style?.backgroundImage || ''}
                onChange={(e) => onUpdate({
                  style: { ...element.style, backgroundImage: e.target.value }
                })}
                placeholder="URL da imagem de fundo"
                className="input-glass"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Cor do Texto</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.style?.textColor || '#ffffff'}
                  onChange={(e) => onUpdate({
                    style: { ...element.style, textColor: e.target.value }
                  })}
                  className="w-12 h-10 p-1 rounded-lg"
                />
                <Input
                  value={element.style?.textColor || '#ffffff'}
                  onChange={(e) => onUpdate({
                    style: { ...element.style, textColor: e.target.value }
                  })}
                  className="input-glass flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Cor do Botão</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.style?.buttonColor || '#3b82f6'}
                  onChange={(e) => onUpdate({
                    style: { ...element.style, buttonColor: e.target.value }
                  })}
                  className="w-12 h-10 p-1 rounded-lg"
                />
                <Input
                  value={element.style?.buttonColor || '#3b82f6'}
                  onChange={(e) => onUpdate({
                    style: { ...element.style, buttonColor: e.target.value }
                  })}
                  className="input-glass flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Arredondamento do Botão: {element.style?.buttonRoundness || 12}px
              </Label>
              <Slider
                value={[element.style?.buttonRoundness || 12]}
                onValueChange={([value]) => onUpdate({
                  style: { ...element.style, buttonRoundness: value }
                })}
                max={32}
                min={0}
                step={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Glassmorphism: {element.style?.glassmorphism || 60}%
              </Label>
              <Slider
                value={[element.style?.glassmorphism || 60]}
                onValueChange={([value]) => onUpdate({
                  style: { ...element.style, glassmorphism: value }
                })}
                max={100}
                min={0}
                step={5}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};
