import { motion } from 'framer-motion';
import { DesignSystem, TrackingConfig } from '@/store/quizStore';
import { Input } from '@/components/ui/input';
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
import { Palette, Zap, Globe } from 'lucide-react';

interface DesignSystemPanelProps {
  designSystem: DesignSystem;
  tracking: TrackingConfig;
  onUpdateDesign: (updates: Partial<DesignSystem>) => void;
  onUpdateTracking: (updates: Partial<TrackingConfig>) => void;
}

export const DesignSystemPanel = ({
  designSystem,
  tracking,
  onUpdateDesign,
  onUpdateTracking,
}: DesignSystemPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Configurações Globais</h2>
        <p className="text-xs text-muted-foreground mt-1">Design System & Tracking</p>
      </div>

      <Tabs defaultValue="design" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-2 glass-card p-1 rounded-lg">
          <TabsTrigger value="design" className="rounded-md text-xs">
            <Palette className="w-3.5 h-3.5 mr-1" />
            Design
          </TabsTrigger>
          <TabsTrigger value="tracking" className="rounded-md text-xs">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Tracking
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Design Tab */}
          <TabsContent value="design" className="p-4 space-y-6 mt-0">
            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Fonte</Label>
              <Select
                value={designSystem.fontFamily}
                onValueChange={(value: DesignSystem['fontFamily']) => onUpdateDesign({ fontFamily: value })}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="geist">Geist</SelectItem>
                  <SelectItem value="system">System UI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={designSystem.primaryColor.startsWith('hsl') ? '#3b82f6' : designSystem.primaryColor}
                  onChange={(e) => onUpdateDesign({ primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 rounded-lg"
                />
                <Input
                  value={designSystem.primaryColor}
                  onChange={(e) => onUpdateDesign({ primaryColor: e.target.value })}
                  className="input-glass flex-1"
                />
              </div>
            </div>

            {/* Button Roundness */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Arredondamento dos Botões: {designSystem.buttonRoundness}px
              </Label>
              <Slider
                value={[designSystem.buttonRoundness]}
                onValueChange={([value]) => onUpdateDesign({ buttonRoundness: value })}
                max={32}
                min={0}
                step={2}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Quadrado</span>
                <span>Arredondado</span>
              </div>
            </div>

            {/* Glassmorphism */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Intensidade do Glassmorphism: {designSystem.glassmorphism}%
              </Label>
              <Slider
                value={[designSystem.glassmorphism]}
                onValueChange={([value]) => onUpdateDesign({ glassmorphism: value })}
                max={100}
                min={0}
                step={5}
              />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
              <div>
                <Label className="text-sm font-medium">Modo Escuro</Label>
                <p className="text-xs text-muted-foreground">Interface dark por padrão</p>
              </div>
              <Switch
                checked={designSystem.darkMode}
                onCheckedChange={(checked) => onUpdateDesign({ darkMode: checked })}
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Preview</Label>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div
                  className="h-10 rounded-lg flex items-center justify-center text-sm font-medium text-white"
                  style={{
                    backgroundColor: designSystem.primaryColor.startsWith('hsl') ? 'hsl(174, 72%, 56%)' : designSystem.primaryColor,
                    borderRadius: `${designSystem.buttonRoundness}px`,
                  }}
                >
                  Botão Exemplo
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="p-4 space-y-6 mt-0">
            {/* Facebook Pixel */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                Facebook Pixel ID
              </Label>
              <Input
                value={tracking.facebookPixelId || ''}
                onChange={(e) => onUpdateTracking({ facebookPixelId: e.target.value })}
                placeholder="123456789012345"
                className="input-glass"
              />
            </div>

            {/* TikTok Pixel */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-black flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                TikTok Pixel ID
              </Label>
              <Input
                value={tracking.tiktokPixelId || ''}
                onChange={(e) => onUpdateTracking({ tiktokPixelId: e.target.value })}
                placeholder="ABCDEFG123456"
                className="input-glass"
              />
            </div>

            {/* GTM */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Google Tag Manager ID
              </Label>
              <Input
                value={tracking.gtmId || ''}
                onChange={(e) => onUpdateTracking({ gtmId: e.target.value })}
                placeholder="GTM-XXXXXXX"
                className="input-glass"
              />
            </div>

            {/* Webhook */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Webhook URL (CRM)
              </Label>
              <Input
                value={tracking.webhookUrl || ''}
                onChange={(e) => onUpdateTracking({ webhookUrl: e.target.value })}
                placeholder="https://hooks.zapier.com/..."
                className="input-glass"
              />
              <p className="text-xs text-muted-foreground">
                Leads serão enviados automaticamente para este endpoint
              </p>
            </div>

            {/* Active Events */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Eventos Configurados</Label>
              {tracking.events.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 rounded-xl bg-secondary/30 text-center">
                  Nenhum evento configurado ainda. Adicione eventos nas propriedades de cada elemento.
                </p>
              ) : (
                <div className="space-y-2">
                  {tracking.events.map((event) => (
                    <div
                      key={event.elementId}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                    >
                      <span className="text-sm">{event.eventName}</span>
                      <span className="text-xs text-primary px-2 py-0.5 rounded bg-primary/10">
                        {event.eventType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};
