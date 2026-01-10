import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackingPanel } from '@/components/admin/TrackingPanel';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  Download,
  Settings
} from 'lucide-react';

export const QuizAnalyticsPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quizzes, analytics, leads, exportLeads } = useQuizStore();
  
  const quiz = quizzes.find((q) => q.id === quizId);
  const quizAnalytics = analytics[quizId!];
  const quizLeads = leads.filter((l) => l.quizId === quizId);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-12 text-center max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4">Quiz não encontrado</h2>
          <Button
            onClick={() => navigate('/admin')}
            className="bg-gradient-to-r from-primary to-cyan-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao painel
          </Button>
        </motion.div>
      </div>
    );
  }

  const completionRate = quizAnalytics
    ? Math.round((quizAnalytics.completions / quizAnalytics.impressions) * 100) || 0
    : 0;

  const conversionRate = quizAnalytics
    ? Math.round((quizAnalytics.leads / quizAnalytics.impressions) * 100) || 0
    : 0;

  const handleExportLeads = () => {
    const data = exportLeads(quizId!);
    const csv = [
      ['Nome', 'Email', 'WhatsApp', 'Score', 'Perfil', 'Data', 'Completo'],
      ...data.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.whatsapp || '',
        lead.score.toString(),
        lead.profile,
        new Date(lead.createdAt).toLocaleDateString('pt-BR'),
        lead.completed ? 'Sim' : 'Não'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${quiz.title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="glass-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">Analytics e configurações</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleExportLeads}
              variant="outline"
              className="glass-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Leads
            </Button>
            <Button
              onClick={() => navigate(`/admin/quiz/${quizId}/edit`)}
              className="bg-gradient-to-r from-primary to-cyan-400"
            >
              <Settings className="w-4 h-4 mr-2" />
              Editar Quiz
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{quizAnalytics?.impressions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Total de acessos ao quiz
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {quizAnalytics?.completions || 0} conclusões
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leads Capturados</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{quizAnalytics?.leads || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {quizLeads.filter(l => l.completed).length} completos
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cyan-400">{conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Visualização → Lead
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Drop-off Analysis */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Análise de Abandono</CardTitle>
                <CardDescription>
                  Veja onde os usuários mais abandonam o quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quiz.elements.map((element, index) => {
                    const dropOffs = quizAnalytics?.dropOffs[element.id] || 0;
                    const dropOffRate = quizAnalytics?.impressions 
                      ? Math.round((dropOffs / quizAnalytics.impressions) * 100)
                      : 0;

                    return (
                      <div key={element.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div>
                          <p className="font-medium">{element.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {element.type.replace('-', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{dropOffs}</p>
                          <p className="text-sm text-muted-foreground">{dropOffRate}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Leads Capturados ({quizLeads.length})</CardTitle>
                <CardDescription>
                  Lista de todos os leads gerados por este quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizLeads.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum lead capturado ainda</p>
                    </div>
                  ) : (
                    quizLeads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                      >
                        <div>
                          <h4 className="font-medium">{lead.name || 'Nome não informado'}</h4>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <p className="text-sm text-muted-foreground">{lead.whatsapp}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{lead.score} pontos</p>
                          <p className="text-sm text-muted-foreground">{lead.profile}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking">
            <TrackingPanel quiz={quiz} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};