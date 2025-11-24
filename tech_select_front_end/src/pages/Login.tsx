import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Lock, Building2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (await login(email, senha)) {
      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao painel de recrutamento',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Erro no login',
        description: 'Email ou senha incorretos',
        variant: 'destructive',
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logoFile) {
      toast({
        title: 'Erro no cadastro',
        description: 'Por favor, selecione uma logo para a empresa',
        variant: 'destructive',
      });
      return;
    }

    const result = await register(email, senha, nome, nomeEmpresa, logoFile);

    if (result.success) {
      toast({
        title: 'Cadastro realizado',
        description: result.message,
      });

      // Simular envio de email de verificação
      setTimeout(() => {
        toast({
          title: 'Email de verificação enviado',
          description: 'Clique aqui para verificar (simulação)',
          action: (
            <Button
              size="sm"
              onClick={() => {
                // Simulação de verificação
                toast({
                  title: 'Email verificado!',
                  description: 'Você já pode fazer login',
                });
              }}
            >
              Verificar
            </Button>
          ),
        });
      }, 1000);

      // Auto-login após cadastro
      if (await login(email, senha)) {
        navigate('/dashboard');
      }
    } else {
      toast({
        title: 'Erro no cadastro',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Tech Select</CardTitle>
            <CardDescription className="text-center">
              Área do Recrutador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-senha">Senha</Label>
                    <Input
                      id="login-senha"
                      type="password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Entrar
                  </Button>
                </form>

              </TabsContent>

              <TabsContent value="cadastro">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cadastro-nome">Nome Completo</Label>
                    <Input
                      id="cadastro-nome"
                      type="text"
                      placeholder="João Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cadastro-email">Email</Label>
                    <Input
                      id="cadastro-email"
                      type="email"
                      placeholder="joao@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cadastro-senha">Senha</Label>
                    <Input
                      id="cadastro-senha"
                      type="password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome-empresa">
                      <Building2 className="inline h-4 w-4 mr-1" />
                      Nome da Empresa
                    </Label>
                    <Input
                      id="nome-empresa"
                      type="text"
                      placeholder="Minha Empresa Ltda"
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-file">Logo da Empresa</Label>
                    <Input
                      id="logo-file"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      required
                    />
                    {logoPreview && (
                      <div className="mt-2 flex justify-center">
                        <img
                          src={logoPreview}
                          alt="Preview da logo"
                          className="h-20 w-20 object-contain rounded border"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Faça upload da logo da empresa (PNG, JPG ou SVG)
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Cadastrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
