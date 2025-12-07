import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Vaga, Setor, NivelVaga } from '@/types';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

const vagaSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
  setor_id: z.string().min(1, 'Selecione um setor'),
  nivel: z.enum(['junior', 'pleno', 'senior']),
  tempo_experiencia_minimo: z.coerce.number().min(0),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000),
  skills_obrigatorias: z.string().optional(),
  skills_desejaveis: z.string().optional(),
});

type VagaForm = z.infer<typeof vagaSchema>;

interface VagaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaga?: Vaga;
  setores: Setor[];
}

const VagaDialog = ({ open, onOpenChange, vaga, setores }: VagaDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [skillsObrigatorias, setSkillsObrigatorias] = useState<string[]>([]);
  const [skillsDesejaveis, setSkillsDesejaveis] = useState<string[]>([]);

  const form = useForm<VagaForm>({
    resolver: zodResolver(vagaSchema),
    defaultValues: {
      titulo: '',
      setor_id: '',
      nivel: 'junior',
      tempo_experiencia_minimo: 0,
      descricao: '',
      skills_obrigatorias: '',
      skills_desejaveis: '',
    },
  });

  useEffect(() => {
    if (vaga) {
      form.reset({
        titulo: vaga.titulo,
        setor_id: vaga.setor_id,
        nivel: vaga.nivel,
        tempo_experiencia_minimo: vaga.tempo_experiencia_minimo,
        descricao: vaga.descricao,
        skills_obrigatorias: '',
        skills_desejaveis: '',
      });
      setSkillsObrigatorias(vaga.skills_obrigatorias);
      setSkillsDesejaveis(vaga.skills_desejaveis);
    } else {
      form.reset({
        titulo: '',
        setor_id: '',
        nivel: 'junior',
        tempo_experiencia_minimo: 0,
        descricao: '',
        skills_obrigatorias: '',
        skills_desejaveis: '',
      });
      setSkillsObrigatorias([]);
      setSkillsDesejaveis([]);
    }
  }, [vaga, form, open]);

  const handleAddSkill = (type: 'obrigatorias' | 'desejaveis') => {
    const value = form.getValues(
      type === 'obrigatorias' ? 'skills_obrigatorias' : 'skills_desejaveis'
    );
    if (!value?.trim()) return;

    if (type === 'obrigatorias') {
      setSkillsObrigatorias([...skillsObrigatorias, value.trim()]);
      form.setValue('skills_obrigatorias', '');
    } else {
      setSkillsDesejaveis([...skillsDesejaveis, value.trim()]);
      form.setValue('skills_desejaveis', '');
    }
  };

  const handleRemoveSkill = (type: 'obrigatorias' | 'desejaveis', index: number) => {
    if (type === 'obrigatorias') {
      setSkillsObrigatorias(skillsObrigatorias.filter((_, i) => i !== index));
    } else {
      setSkillsDesejaveis(skillsDesejaveis.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: VagaForm) => {
    if (skillsObrigatorias.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos uma skill obrigatória',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar uma vaga',
        variant: 'destructive',
      });
      return;
    }

    const vagaData = {
      titulo: data.titulo,
      setor_id: data.setor_id,
      recrutador_id: user.id,
      nivel: data.nivel as NivelVaga,
      tempo_experiencia_minimo: data.tempo_experiencia_minimo,
      descricao: data.descricao,
      skills_obrigatorias: skillsObrigatorias,
      skills_desejaveis: skillsDesejaveis,
      ativa: true,
    };

    try {
      if (vaga) {
        await api.updateVaga(parseInt(vaga.id), vagaData);
        toast({
          title: 'Vaga atualizada',
          description: 'A vaga foi atualizada com sucesso',
        });
      } else {
        await api.createVaga(vagaData);
        toast({
          title: 'Vaga criada',
          description: 'A vaga foi criada com sucesso',
        });
      }
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Erro',
        description: vaga ? 'Erro ao atualizar vaga' : 'Erro ao criar vaga',
        variant: 'destructive',
      });
      console.error('Error saving vaga:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vaga ? 'Editar Vaga' : 'Nova Vaga'}</DialogTitle>
          <DialogDescription>
            Preencha os dados da vaga abaixo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Vaga</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desenvolvedor Full Stack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="setor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {setores.map(setor => (
                        <SelectItem key={setor.id} value={setor.id}>
                          {setor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nivel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="junior">Júnior</SelectItem>
                      <SelectItem value="pleno">Pleno</SelectItem>
                      <SelectItem value="senior">Sênior</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tempo_experiencia_minimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo de Experiência Mínimo (meses)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as responsabilidades e requisitos da vaga"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills_obrigatorias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills Obrigatórias</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Digite uma skill e pressione Adicionar"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill('obrigatorias');
                          }
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() => handleAddSkill('obrigatorias')}
                      variant="secondary"
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillsObrigatorias.map((skill, index) => (
                      <Badge key={index} variant="default">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill('obrigatorias', index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills_desejaveis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills Desejáveis</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Digite uma skill e pressione Adicionar"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill('desejaveis');
                          }
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() => handleAddSkill('desejaveis')}
                      variant="secondary"
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillsDesejaveis.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill('desejaveis', index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{vaga ? 'Atualizar' : 'Criar'} Vaga</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VagaDialog;
