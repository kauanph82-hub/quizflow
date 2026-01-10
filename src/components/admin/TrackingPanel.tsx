import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quiz, useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Zap, 
  Webhook, 
  Eye, 
  UserPlus, 
  ShoppingCart,
  Settings,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrackingPanelProps {
  quiz: Quiz;
}

export const TrackingPanel = ({ quiz }: TrackingPanelProps) => {
  const { updateTracking } = useQuizStore();
  const { toast } = useToast();
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [tracking, setTracking] = useState(quiz.tracking);

  const handleSave = () => {
    updateTracking(quiz.id, tracking);
    toast({
      title: "Configurações salvas",
      description: "As configurações de tracking foram atualizadas com sucesso.",
    });
  };

  const testWebhook = async () => {
    if (!tracking.webhookUrl) {
      toast({
        title: "URL do Webhook necessária",
        description: "Configure a URL do webhook antes de testar.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingWebhook(true);
    setWebhookStatus('idle');

    try {
      const testPayload = {
        test: true,
        quizId: quiz.id,
        quizTitle: quiz.title,
        lead: {
          name: "João Silva",
          email: "joao@exemplo.com",
          whatsapp: "+5511999999999",
          score: 85,
          tags: ["moderado", "experiente"],
          profile: "Investidor Moderado",
        },
        answers: {
          q1: "q1_c",
          q2: "q2_c",
          q3: 70,
        },
        timestamp: new Date().toISOString(),
        utm: {
          source: "facebook",
          medium: "cpc",
          campaign: "quiz-investidor",
        },
      };

      const response = await fetch(tracking.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        setWebhookStatus('success');
        toast({
          title: "Webhook testado com sucesso!",
          description: `Resposta: ${response.status} ${response.statusText}`,
        });
      } else {
        setWebhookStatus('error');
        toast({
          title: "Erro no teste do webhook",
          description: `Resposta: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setWebhookStatus('error');
      toast({
        title: "Erro no teste do webhook",
        description: "Não foi possível conectar com o webhook.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Tracking</h2>
          <p className="text-muted-foreground">
            Configure pixels, webhooks e eventos de conversão
          </p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-cyan-400">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>

      <Tabs defaultValue="pixels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pixels">Pixels</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        {/* Pixels Tab */}
        <TabsContent value="pixels" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Facebook Pixel */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-500" />
                  Facebook Pixel
                </CardTitle>
                <CardDescription>
                  Configure o Pixel do Facebook para tracking de conversões server-side
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebook-pixel">Pixel ID</Label>
                  <Input
                    id="facebook-pixel"
                    value={tracking.facebookPixelId || ''}
                    onChange={(e) => setTracking({ ...tracking, facebookPixelId: e.target.value })}
                    placeholder="123456789012345"
                    className="input-glass"
                  />
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Vantagem Server-Side:</strong> Ignora bloqueadores de anúncio e aumenta a precisão do pixel em até 30%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* TikTok Pixel */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-500" />
                  TikTok Pixel
                </CardTitle>
                <CardDescription>
                  Configure o Pixel do TikTok para campanhas na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tiktok-pixel">Pixel ID</Label>
                  <Input
                    id="tiktok-pixel"
                    value={tracking.tiktokPixelId || ''}
                    onChange={(e) => setTracking({ ...tracking, tiktokPixelId: e.target.value })}
                    placeholder="C4A1B2C3D4E5F6G7H8I9J0"
                    className="input-glass"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Google Tag Manager */}
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Google Tag Manager
                </CardTitle>
                <CardDescription>
                  Configure o GTM para gerenciar todos os seus pixels e eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="gtm-id">Container ID</Label>
                  <Input
                    id="gtm-id"
                    value={tracking.gtmId || ''}
                    onChange={(e) => setTracking({ ...tracking, gtmId: e.target.value })}
                    placeholder="GTM-XXXXXXX"
                    className="input-glass"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-primary" />
                Webhook de Conversão
                {webhookStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {webhookStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Configure um webhook para receber dados de leads em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="webhook-url">URL do Webhook</Label>
                <Input
                  id="webhook-url"
                  value={tracking.webhookUrl || ''}
                  onChange={(e) => setTracking({ ...tracking, webhookUrl: e.target.value })}
                  placeholder="https://seu-servidor.com/webhook/quiz-leads"
                  className="input-glass"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={testWebhook}
                  disabled={isTestingWebhook || !tracking.webhookUrl}
                  variant="outline"
                  className="glass-button"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTestingWebhook ? 'Testando...' : 'Testar Webhook'}
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Exemplo de Payload:</h4>
                <pre className="p-4 rounded-lg bg-secondary/50 text-sm overflow-x-auto">
{`{
  "quizId": "${quiz.id}",
  "quizTitle": "${quiz.title}",
  "lead": {
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "whatsapp": "+5511999999999",
    "score": 85,
    "tags": ["moderado", "experiente"],
    "profile": "Investidor Moderado"
  },
  "answers": {
    "q1": "q1_c",
    "q2": "q2_c",
    "q3": 70
  },
  "timestamp": "2024-01-10T15:30:00.000Z",
  "utm": {
    "source": "facebook",
    "medium": "cpc",
    "campaign": "quiz-investidor"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Eventos de Conversão</CardTitle>
              <CardDescription>
                Configure quais eventos serão disparados durante o quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quiz.elements.map((element) => {
                  const existingEvent = tracking.events.find(e => e.elementId === element.id);
                  const eventTypes = [
                    { value: 'ViewContent', label: 'Visualização', icon: Eye },
                    { value: 'Lead', label: 'Lead Capturado', icon: UserPlus },
                    { value: 'Purchase', label: 'Conversão', icon: ShoppingCart },
                  ];

                  return (
                    <motion.div
                      key={element.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div>
                        <h5 className="font-medium">{element.title}</h5>
                        <p className="text-sm text-muted-foreground capitalize">
                          {element.type.replace('-', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {existingEvent && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {existingEvent.eventName}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Logic to configure event
                            const newEvent = {
                              elementId: element.id,
                              eventName: element.type === 'lead-form' ? 'Lead' : 'ViewContent',
                              eventType: element.type === 'lead-form' ? 'Lead' as const : 'ViewContent' as const,
                            };
                            
                            const updatedEvents = existingEvent 
                              ? tracking.events.map(e => e.elementId === element.id ? newEvent : e)
                              : [...tracking.events, newEvent];
                            
                            setTracking({ ...tracking, events: updatedEvents });
                          }}
                          className="glass-button"
                        >
                          {existingEvent ? 'Editar' : 'Configurar'}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};