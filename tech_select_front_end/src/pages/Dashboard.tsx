import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Users, Building2, LogOut } from 'lucide-react';
import VagasTab from '@/components/dashboard/VagasTab';
import SetoresTab from '@/components/dashboard/SetoresTab';
import CandidatosTab from '@/components/dashboard/CandidatosTab';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    vagas: 0,
    candidaturas: 0,
    setores: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const [vagas, candidaturas, setores] = await Promise.all([
          api.getVagas(parseInt(user.id)),
          api.getCandidaturas(parseInt(user.id)),
          api.getSetores(parseInt(user.id)),
        ]);
        setStats({
          vagas: vagas.length,
          candidaturas: candidaturas.length,
          setores: setores.length,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas', error);
      }
    };

    fetchStats();
  }, [isAuthenticated, navigate, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tech Select - Painel de Recrutamento</h1>
              <p className="text-sm text-muted-foreground">Bem-vindo, {user?.nome}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/">Ver Vagas Públicas</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vagas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidaturas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.candidaturas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Setores</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.setores}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vagas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vagas">Vagas</TabsTrigger>
            <TabsTrigger value="candidatos">Candidatos</TabsTrigger>
            <TabsTrigger value="setores">Setores</TabsTrigger>
          </TabsList>
          <TabsContent value="vagas">
            <VagasTab />
          </TabsContent>
          <TabsContent value="candidatos">
            <CandidatosTab />
          </TabsContent>
          <TabsContent value="setores">
            <SetoresTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
