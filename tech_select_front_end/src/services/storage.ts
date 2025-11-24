import { Vaga, Candidatura, Setor, Recrutador, StatusCandidato } from '@/types';

const STORAGE_KEYS = {
  VAGAS: 'rh_vagas',
  CANDIDATURAS: 'rh_candidaturas',
  SETORES: 'rh_setores',
  RECRUTADORES: 'rh_recrutadores',
  AUTH: 'rh_auth',
};

// Inicializar com dados de exemplo
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.RECRUTADORES)) {
    const recrutadorPadrao: Recrutador = {
      id: '1',
      email: 'admin@empresa.com',
      senha: 'admin123',
      nome: 'Administrador',
      nome_empresa: 'Tech Select',
      logo_url: '/tech-select-logo.png',
      email_verificado: true,
    };
    localStorage.setItem(STORAGE_KEYS.RECRUTADORES, JSON.stringify([recrutadorPadrao]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SETORES)) {
    const setoresPadrao: Setor[] = [
      { id: '1', nome: 'Tecnologia', createdAt: new Date().toISOString() },
      { id: '2', nome: 'Recursos Humanos', createdAt: new Date().toISOString() },
      { id: '3', nome: 'Financeiro', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.SETORES, JSON.stringify(setoresPadrao));
  }

  if (!localStorage.getItem(STORAGE_KEYS.VAGAS)) {
    localStorage.setItem(STORAGE_KEYS.VAGAS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATURAS)) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATURAS, JSON.stringify([]));
  }
};

initializeStorage();

// Vagas
export const getVagas = (): Vaga[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.VAGAS) || '[]');
};

export const getVagasAtivas = (): Vaga[] => {
  return getVagas().filter(v => v.ativa);
};

export const getVaga = (id: string): Vaga | undefined => {
  return getVagas().find(v => v.id === id);
};

export const saveVaga = (vaga: Omit<Vaga, 'id' | 'createdAt'>): Vaga => {
  const vagas = getVagas();
  const novaVaga: Vaga = {
    ...vaga,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  vagas.push(novaVaga);
  localStorage.setItem(STORAGE_KEYS.VAGAS, JSON.stringify(vagas));
  return novaVaga;
};

export const updateVaga = (id: string, vaga: Partial<Vaga>): void => {
  const vagas = getVagas();
  const index = vagas.findIndex(v => v.id === id);
  if (index !== -1) {
    vagas[index] = { ...vagas[index], ...vaga };
    localStorage.setItem(STORAGE_KEYS.VAGAS, JSON.stringify(vagas));
  }
};

export const deleteVaga = (id: string): void => {
  const vagas = getVagas().filter(v => v.id !== id);
  localStorage.setItem(STORAGE_KEYS.VAGAS, JSON.stringify(vagas));
};

// Setores
export const getSetores = (): Setor[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETORES) || '[]');
};

export const getSetor = (id: string): Setor | undefined => {
  return getSetores().find(s => s.id === id);
};

export const saveSetor = (nome: string): Setor => {
  const setores = getSetores();
  const novoSetor: Setor = {
    id: Date.now().toString(),
    nome,
    createdAt: new Date().toISOString(),
  };
  setores.push(novoSetor);
  localStorage.setItem(STORAGE_KEYS.SETORES, JSON.stringify(setores));
  return novoSetor;
};

export const deleteSetor = (id: string): void => {
  const setores = getSetores().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SETORES, JSON.stringify(setores));
};

// Candidaturas
export const getCandidaturas = (): Candidatura[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATURAS) || '[]');
};

export const getCandidaturasByVaga = (vagaId: string): Candidatura[] => {
  return getCandidaturas().filter(c => c.vaga_id === vagaId);
};

const calcularStatus = (
  candidatura: Omit<Candidatura, 'id' | 'createdAt' | 'status'>,
  vaga: Vaga
): StatusCandidato => {
  // Verificar tempo de experiência mínimo
  if (candidatura.tempo_experiencia < vaga.tempo_experiencia_minimo) {
    return 'inapto';
  }

  // Verificar skills obrigatórias
  const temTodasObrigatorias = vaga.skills_obrigatorias.every(skill =>
    candidatura.skills.includes(skill)
  );

  if (!temTodasObrigatorias) {
    return 'inapto';
  }

  // Contar skills desejáveis
  const skillsDesejaveisAtendidas = vaga.skills_desejaveis.filter(skill =>
    candidatura.skills.includes(skill)
  ).length;

  if (skillsDesejaveisAtendidas >= 3) {
    return 'muito_apto';
  }

  return 'apto';
};

export const saveCandidatura = (
  candidatura: Omit<Candidatura, 'id' | 'createdAt' | 'status'>
): Candidatura => {
  const candidaturas = getCandidaturas();
  const vaga = getVaga(candidatura.vaga_id);
  
  if (!vaga) {
    throw new Error('Vaga não encontrada');
  }

  const novaCandidatura: Candidatura = {
    ...candidatura,
    id: Date.now().toString(),
    status: calcularStatus(candidatura, vaga),
    createdAt: new Date().toISOString(),
  };

  candidaturas.push(novaCandidatura);
  localStorage.setItem(STORAGE_KEYS.CANDIDATURAS, JSON.stringify(candidaturas));
  return novaCandidatura;
};

// Autenticação
export const login = (email: string, senha: string): Recrutador | null => {
  const recrutadores: Recrutador[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.RECRUTADORES) || '[]'
  );
  const recrutador = recrutadores.find(
    r => r.email === email && r.senha === senha
  );
  
  if (recrutador) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(recrutador));
    return recrutador;
  }
  
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
};

export const getAuthUser = (): Recrutador | null => {
  const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
  return auth ? JSON.parse(auth) : null;
};

export const register = (
  email: string,
  senha: string,
  nome: string,
  nome_empresa: string,
  logo_url: string
): Recrutador | null => {
  const recrutadores: Recrutador[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.RECRUTADORES) || '[]'
  );
  
  // Verificar se email já existe
  if (recrutadores.some(r => r.email === email)) {
    return null;
  }

  const novoRecrutador: Recrutador = {
    id: Date.now().toString(),
    email,
    senha,
    nome,
    nome_empresa,
    logo_url,
    email_verificado: false,
  };

  recrutadores.push(novoRecrutador);
  localStorage.setItem(STORAGE_KEYS.RECRUTADORES, JSON.stringify(recrutadores));
  return novoRecrutador;
};

export const verificarEmail = (id: string): void => {
  const recrutadores: Recrutador[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.RECRUTADORES) || '[]'
  );
  const index = recrutadores.findIndex(r => r.id === id);
  if (index !== -1) {
    recrutadores[index].email_verificado = true;
    localStorage.setItem(STORAGE_KEYS.RECRUTADORES, JSON.stringify(recrutadores));
  }
};

export const getRecrutador = (id: string): Recrutador | undefined => {
  const recrutadores: Recrutador[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.RECRUTADORES) || '[]'
  );
  return recrutadores.find(r => r.id === id);
};
