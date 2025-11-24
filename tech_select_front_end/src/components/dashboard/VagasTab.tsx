import { useState, useEffect } from 'react';
import { Vaga, Setor } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VagaDialog from './VagaDialog';

const VagasTab = () => {
  const { user } = useAuth();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVaga, setEditingVaga] = useState<Vaga | undefined>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [vagasData, setoresData] = await Promise.all([
        api.getVagas(parseInt(user.id)),
        api.getSetores(parseInt(user.id)),
      ]);
      setVagas(vagasData);
      setSetores(setoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        await api.deleteVaga(parseInt(id));
        await loadData();
        toast({
          title: 'Vaga excluída',
          description: 'A vaga foi removida com sucesso',
        });
      } catch (error) {
        console.error('Erro ao excluir vaga:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a vaga',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleAtiva = async (vaga: Vaga) => {
    try {
      await api.updateVaga(parseInt(vaga.id), { ativa: !vaga.ativa });
      await loadData();
      toast({
        title: vaga.ativa ? 'Vaga desativada' : 'Vaga ativada',
        description: `A vaga foi ${vaga.ativa ? 'desativada' : 'ativada'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a vaga',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (vaga: Vaga) => {
    setEditingVaga(vaga);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingVaga(undefined);
    loadData();
  };

  const getSetorNome = (setorId: string) => {
    return setores.find(s => s.id === setorId)?.nome || 'N/A';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Vagas</CardTitle>
            <CardDescription>Crie e gerencie as vagas da empresa</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vagas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma vaga cadastrada
            </p>
          ) : (
            vagas.map(vaga => (
              <Card key={vaga.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{vaga.titulo}</h3>
                        <Badge variant={vaga.ativa ? 'default' : 'secondary'}>
                          {vaga.ativa ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {getSetorNome(vaga.setor_id)} • {vaga.nivel} • {vaga.tempo_experiencia_minimo} meses
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium mb-1">Skills Obrigatórias:</p>
                          <div className="flex flex-wrap gap-1">
                            {vaga.skills_obrigatorias.map((skill, idx) => (
                              <Badge key={idx} variant="default" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {vaga.skills_desejaveis.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Skills Desejáveis:</p>
                            <div className="flex flex-wrap gap-1">
                              {vaga.skills_desejaveis.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vaga)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>

      <VagaDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        vaga={editingVaga}
        setores={setores}
      />
    </Card>
  );
};

export default VagasTab;
