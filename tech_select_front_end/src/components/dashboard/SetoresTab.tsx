import { useState, useEffect } from 'react';
import { Setor } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SetoresTab = () => {
  const { user } = useAuth();
  const [setores, setSetores] = useState<Setor[]>([]);
  const [novoSetor, setNovoSetor] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const setoresData = await api.getSetores(parseInt(user.id));
      setSetores(setoresData);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os setores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreate = async () => {
    if (!novoSetor.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite o nome do setor',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.createSetor({ nome: novoSetor.trim(), idRecrutador: parseInt(user.id) });
      setNovoSetor('');
      await loadData();
      toast({
        title: 'Setor criado',
        description: 'O setor foi criado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o setor',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      try {
        await api.deleteSetor(parseInt(id));
        await loadData();
        toast({
          title: 'Setor excluído',
          description: 'O setor foi removido com sucesso',
        });
      } catch (error) {
        console.error('Erro ao excluir setor:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o setor',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Setores</CardTitle>
        <CardDescription>Crie e gerencie os setores da empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="novo-setor">Novo Setor</Label>
            <Input
              id="novo-setor"
              placeholder="Nome do setor"
              value={novoSetor}
              onChange={(e) => setNovoSetor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Carregando...
            </p>
          ) : setores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum setor cadastrado
            </p>
          ) : (
            setores.map(setor => (
              <Card key={setor.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <span className="font-medium">{setor.nome}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(setor.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SetoresTab;
