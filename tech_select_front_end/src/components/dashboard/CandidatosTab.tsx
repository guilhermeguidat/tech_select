import { useState, useEffect } from 'react';
import { Candidatura, Vaga, StatusCandidato } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Clock, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const CandidatosTab = () => {
  const { user } = useAuth();
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [vagaSelecionada, setVagaSelecionada] = useState<string>('todas');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const [candidaturasData, vagasData] = await Promise.all([
          api.getCandidaturas(parseInt(user.id)),
          api.getVagas(parseInt(user.id)),
        ]);
        setCandidaturas(candidaturasData);
        setVagas(vagasData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const candidaturasFiltradas = vagaSelecionada === 'todas'
    ? candidaturas
    : candidaturas.filter(c => c.vaga_id === vagaSelecionada);

  const getStatusColor = (status: StatusCandidato) => {
    switch (status) {
      case 'muito_apto':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'apto':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'inapto':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const getStatusIcon = (status: StatusCandidato) => {
    switch (status) {
      case 'muito_apto':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'apto':
        return <AlertCircle className="h-4 w-4" />;
      case 'inapto':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: StatusCandidato) => {
    switch (status) {
      case 'muito_apto':
        return 'Muito Apto';
      case 'apto':
        return 'Apto';
      case 'inapto':
        return 'Inapto';
    }
  };

  const getVagaTitulo = (vagaId: string) => {
    return vagas.find(v => v.id === vagaId)?.titulo || 'N/A';
  };

  const getVaga = (vagaId: string) => {
    return vagas.find(v => v.id === vagaId);
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
            <CardTitle>Candidatos</CardTitle>
            <CardDescription>Visualize e gerencie as candidaturas</CardDescription>
          </div>
          <div className="w-[250px]">
            <Select value={vagaSelecionada} onValueChange={setVagaSelecionada}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as vagas</SelectItem>
                {vagas.map(vaga => (
                  <SelectItem key={vaga.id} value={vaga.id}>
                    {vaga.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidaturasFiltradas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma candidatura encontrada
            </p>
          ) : (
            candidaturasFiltradas.map(candidatura => {
              const vaga = getVaga(candidatura.vaga_id);
              return (
                <Card key={candidatura.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{candidatura.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Vaga: {getVagaTitulo(candidatura.vaga_id)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(candidatura.status)}
                      >
                        {getStatusIcon(candidatura.status)}
                        <span className="ml-1">{getStatusLabel(candidatura.status)}</span>
                      </Badge>
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {candidatura.email}
                      </div>
                      {candidatura.telefone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {candidatura.telefone}
                        </div>
                      )}
                      {candidatura.tempo_experiencia > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Experiência: {candidatura.tempo_experiencia} meses
                        </div>
                      )}
                      {candidatura.curriculo_url && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <a
                            href={candidatura.curriculo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Ver currículo
                          </a>
                        </div>
                      )}
                    </div>

                    {candidatura.skills && candidatura.skills.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Skills do candidato:</p>
                        <div className="flex flex-wrap gap-1">
                          {candidatura.skills.map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant={vaga?.skills_obrigatorias.includes(skill) ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidatosTab;
