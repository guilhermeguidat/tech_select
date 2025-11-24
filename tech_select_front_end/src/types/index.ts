export type NivelVaga = 'junior' | 'pleno' | 'senior';

export type StatusCandidato = 'muito_apto' | 'apto' | 'inapto';

export interface Setor {
  id: string;
  nome: string;
  createdAt: string;
}

export interface Vaga {
  id: string;
  titulo: string;
  setor_id: string;
  setor_nome?: string; // Nome do setor (opcional, vem do backend)
  recrutador_id: string;
  nivel: NivelVaga;
  skills_obrigatorias: string[];
  skills_desejaveis: string[];
  tempo_experiencia_minimo: number; // em meses
  descricao: string;
  ativa: boolean;
  createdAt: string;
}

export interface Candidatura {
  id: string;
  vaga_id: string;
  nome: string;
  email: string;
  telefone: string;
  skills: string[];
  tempo_experiencia: number; // em meses
  curriculo_url: string;
  status: StatusCandidato;
  createdAt: string;
}

export interface Recrutador {
  id: string;
  email: string;
  senha: string;
  nome: string;
  nome_empresa: string;
  logo_url: string;
  email_verificado: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  email: string;
  senha: string;
  nome: string;
  nomeEmpresa: string;
  urlLogo: string;
}
