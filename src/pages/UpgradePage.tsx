import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  Sparkles,
  Copy,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const UpgradePage = () => {
  const { user, premiumStatus, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const PIX_KEY = 'b753f557-cf56-4e21-b65a-fa18586b9b37';

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(PIX_KEY);
    toast({
      title: 'Chave PIX copiada!',
      description: 'Cole no seu app de pagamento para finalizar a compra.',
    });
  };

  const handlePaymentConfirmation = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: 'Pagamento em análise',
        description: 'Você receberá um email de confirmação em até 5 minutos.',
      });
      setIsProcessingPayment(false);
    }, 2000);
  };

  const features = [
    {
      category: 'Criação de Quizzes',
      free: ['1 quiz ativo', 'Templates básicos', 'Elementos limitados'],
      premium: ['Quizzes ilimitados', 'Templates premium', 'Todos os elementos', 'A/B Testing', 'Lógica condicional avançada']
    },
    {
      category: 'Captura de Leads',
      free: ['Lead capture básico', 'Perda por abandono'],
      premium: ['Shadow Lead Capture', '0% perda de leads', 'Captura em tempo real', 'Recuperação automática']
    },
    {
      category: 'Analytics & Tracking',
      free: ['Métricas básicas', 'Relatórios simples'],
      premium: ['Analytics avançado', 'Heatmap de abandono', 'Pixels server-side', 'Multi-pixel (FB, TikTok, Google)', 'Webhooks personalizados']
    },
    {
      category: 'Personalização',
      free: ['Temas básicos', 'Cores limitadas'],
      premium: ['Glassmorphism premium', 'CSS customizado', 'Branding completo', 'Domínio personalizado']
    },
    {
      category: 'Suporte',
      free: ['Email (48h)', 'Documentação'],
      premium: ['Suporte prioritário', 'WhatsApp direto', 'Setup personalizado', 'Consultoria de conversão']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="glass-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Button>
          
          {premiumStatus.type === 'trial' && (
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              Trial: {premiumStatus.daysLeft} dias restantes
            </Badge>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-primary to-cyan-400 flex items-center justify-center"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Desbloqueie o{' '}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Poder Total
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Transforme seu negócio com a plataforma de quiz mais avançada do Brasil. 
            Zero perda de leads, tracking server-side e ROI comprovado.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-white/10 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Gratuito</CardTitle>
                  <Badge variant="outline" className="border-white/20">Atual</Badge>
                </div>
                <CardDescription>Para testar a plataforma</CardDescription>
                <div className="text-3xl font-bold mt-4">R$ 0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>1 quiz ativo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>100 leads/mês</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Analytics básico</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-muted-foreground">Shadow Lead Capture</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-muted-foreground">Pixels server-side</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-muted-foreground">A/B Testing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-primary/50 relative overflow-hidden h-full">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-primary to-cyan-400 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>Para profissionais sérios</CardDescription>
                <div className="text-3xl font-bold mt-4 flex items-baseline gap-2">
                  R$ 97
                  <span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-green-400">💰 ROI médio: 300% no primeiro mês</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span><strong>Quizzes ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span><strong>Leads ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span><strong>Shadow Lead Capture</strong> (0% perda)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span><strong>Pixels server-side</strong> (ignora AdBlock)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span><strong>A/B Testing</strong> + Analytics avançado</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span><strong>Suporte prioritário</strong> + WhatsApp</span>
                  </li>
                </ul>

                <Button
                  onClick={handlePaymentConfirmation}
                  disabled={isProcessingPayment}
                  className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 text-white font-semibold rounded-xl glow-effect"
                >
                  {isProcessingPayment ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    'Upgrade Agora'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* PIX Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <Card className="glass-card border-primary/30">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PIX</span>
                </div>
                Pagamento via PIX
              </CardTitle>
              <CardDescription>
                Ativação instantânea após confirmação do pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Chave PIX (UUID)</p>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {PIX_KEY}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyPixKey}
                    variant="outline"
                    size="sm"
                    className="glass-button"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  1. Copie a chave PIX acima
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Faça o pagamento de <strong>R$ 97,00</strong> no seu app
                </p>
                <p className="text-sm text-muted-foreground">
                  3. Sua conta será ativada automaticamente
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-300 text-center">
                  🔒 Pagamento 100% seguro • ⚡ Ativação em até 5 minutos
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Compare os Planos
          </h2>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-muted-foreground">Gratuito</h4>
                      <ul className="space-y-2">
                        {feature.free.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded-full border border-muted-foreground" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-primary">Premium</h4>
                      <ul className="space-y-2">
                        {feature.premium.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Testimonials/Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Por que escolher o XQuiz Pro?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">0%</div>
                <p className="text-sm text-muted-foreground">Perda de leads com Shadow Capture</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">+30%</div>
                <p className="text-sm text-muted-foreground">Mais conversões com pixels server-side</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">300%</div>
                <p className="text-sm text-muted-foreground">ROI médio no primeiro mês</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};