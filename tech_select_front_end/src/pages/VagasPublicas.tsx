import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vaga, Setor, Recrutador } from '@/types';
import { getSetor, getRecrutador } from '@/services/storage';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, MapPin, Clock, Search } from 'lucide-react';

const VagasPublicas = () => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [setores, setSetores] = useState<Map<string, Setor>>(new Map());
  const [recrutadores, setRecrutadores] = useState<Map<string, Recrutador>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVagas = async () => {
      try {
        // Fetching all public vacancies
        const data = await api.getVagasPublicas();
        setVagas(data); // Save vagas to state

        const setoresMap = new Map<string, Setor>();
        const recrutadoresMap = new Map<string, Recrutador>();

        data.forEach(vaga => {
          const setor = getSetor(vaga.setor_id);
          if (setor) {
            setoresMap.set(setor.id, setor);
          }

          const recrutador = getRecrutador(vaga.recrutador_id);
          if (recrutador) {
            recrutadoresMap.set(recrutador.id, recrutador);
          }
        });

        setSetores(setoresMap);
        setRecrutadores(recrutadoresMap);
      } catch (error) {
        console.error('Erro ao carregar vagas', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVagas();
  }, []);

  const getNivelLabel = (nivel: string) => {
    const labels = {
      junior: 'Júnior',
      pleno: 'Pleno',
      senior: 'Sênior',
    };
    return labels[nivel as keyof typeof labels] || nivel;
  };

  const filteredVagas = vagas.filter(vaga => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const setorNome = setores.get(vaga.setor_id)?.nome.toLowerCase() || '';

    return (
      vaga.titulo.toLowerCase().includes(searchLower) ||
      vaga.descricao.toLowerCase().includes(searchLower) ||
      setorNome.includes(searchLower) ||
      vaga.skills_obrigatorias.some(skill => skill.toLowerCase().includes(searchLower)) ||
      vaga.skills_desejaveis.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tech Select</h1>
              <p className="text-muted-foreground mt-1">
                Encontre a oportunidade perfeita para você
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Área do Recrutador
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar vagas por título, skills, setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p>Carregando vagas...</p>
          </div>
        ) : filteredVagas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                {searchTerm ? 'Nenhuma vaga encontrada com os filtros aplicados' : 'Nenhuma vaga disponível no momento'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVagas.map(vaga => {
              const recrutador = recrutadores.get(vaga.recrutador_id);
              return (
                <Card key={vaga.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      {recrutador && (
                        <div className="flex-shrink-0">
                          <img
                            src={recrutador.logo_url}
                            alt={recrutador.nome_empresa}
                            className="h-12 w-12 object-contain rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/tech-select-logo.png';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-1">{vaga.titulo}</CardTitle>
                        {recrutador && (
                          <p className="text-sm font-medium text-foreground mb-1">
                            {recrutador.nome_empresa}
                          </p>
                        )}
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {vaga.setor_nome}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{getNivelLabel(vaga.nivel)}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {vaga.tempo_experiencia_minimo} meses
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Skills Obrigatórias:</p>
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
                          <p className="text-sm font-medium mb-2">Skills Desejáveis:</p>
                          <div className="flex flex-wrap gap-1">
                            {vaga.skills_desejaveis.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {vaga.descricao}
                      </p>

                      <Button
                        className="w-full"
                        onClick={() => navigate(`/candidatar/${vaga.id}`)}
                      >
                        Candidatar-se
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default VagasPublicas;
