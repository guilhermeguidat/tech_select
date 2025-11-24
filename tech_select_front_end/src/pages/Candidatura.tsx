import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Vaga } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const candidaturaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  telefone: z.string().regex(/^\d{11}$/, 'Telefone deve ter exatamente 11 dígitos'),
  skills: z.array(z.string()).min(1, 'Selecione pelo menos uma skill'),
  tempo_experiencia: z.coerce.number().min(0, 'Tempo de experiência inválido'),
});

type CandidaturaForm = z.infer<typeof candidaturaSchema>;

const Candidatura = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vaga, setVaga] = useState<Vaga | null>(null);

  const form = useForm<CandidaturaForm>({
    resolver: zodResolver(candidaturaSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      skills: [],
      tempo_experiencia: 0,
    },
  });

  useEffect(() => {
    const fetchVaga = async () => {
      if (id) {
        try {
          const vagaEncontrada = await api.getVaga(id);
          if (vagaEncontrada && vagaEncontrada.ativa) {
            setVaga(vagaEncontrada);
          } else {
            toast({
              title: 'Erro',
              description: 'Vaga não encontrada ou inativa',
              variant: 'destructive',
            });
            navigate('/');
          }
        } catch (error) {
          toast({
            title: 'Erro',
            description: 'Erro ao carregar vaga',
            variant: 'destructive',
          });
          navigate('/');
        }
      }
    };
    fetchVaga();
  }, [id, navigate, toast]);

  const onSubmit = async (data: CandidaturaForm) => {
    if (!vaga) return;

    try {
      // Map skills to backend format
      const skillsRequest = data.skills.map(skill => ({
        descricao: skill,
        nivel: 'CANDIDATURA' // NivelSkill enum has CANDIDATURA for candidate skills
      }));

      await api.createCandidatura({
        idVaga: parseInt(vaga.id),
        nomeCompleto: data.nome,
        email: data.email,
        telefone: data.telefone,
        exp: data.tempo_experiencia,
        skills: skillsRequest,
      });

      toast({
        title: 'Candidatura enviada!',
        description: 'Boa sorte no processo seletivo!',
      });

      navigate('/');
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar candidatura.',
        variant: 'destructive',
      });
    }
  };

  if (!vaga) {
    return null;
  }

  const todasSkills = [...vaga.skills_obrigatorias, ...vaga.skills_desejaveis];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para vagas
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{vaga.titulo}</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo para se candidatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tempo_experiencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Experiência (meses)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tempo mínimo requerido: {vaga.tempo_experiencia_minimo} meses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Skills</FormLabel>
                        <FormDescription>
                          Selecione as skills que você possui
                        </FormDescription>
                      </div>
                      <div className="space-y-2">
                        {todasSkills.map((skill) => (
                          <FormField
                            key={skill}
                            control={form.control}
                            name="skills"
                            render={({ field }) => {
                              const isObrigatoria = vaga.skills_obrigatorias.includes(skill);
                              return (
                                <FormItem
                                  key={skill}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(skill)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, skill])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== skill
                                            )
                                          );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {skill}
                                    {isObrigatoria && (
                                      <span className="text-destructive ml-1">*</span>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Enviar Candidatura
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Candidatura;
