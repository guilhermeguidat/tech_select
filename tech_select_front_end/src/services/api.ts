import { Vaga, Candidatura, Setor, Recrutador, LoginRequest } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const api = {
    login: async (data: LoginRequest): Promise<Recrutador & { token: string }> => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Login failed');
        const backendData = await response.json();
        return {
            id: backendData.idRecrutador.toString(),
            token: backendData.token,
            email: backendData.email,
            nome: backendData.nome,
            nome_empresa: backendData.nomeEmpresa,
            logo_url: backendData.urlLogo,
            email_verificado: true,
            senha: '',
        };
    },

    register: async (data: FormData): Promise<Recrutador> => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            body: data,
        });
        if (!response.ok) throw new Error('Registration failed');
        const backendRecrutador = await response.json();
        return {
            id: backendRecrutador.idRecrutador.toString(),
            email: backendRecrutador.email,
            nome: backendRecrutador.nomeCompleto,
            nome_empresa: backendRecrutador.nomeEmpresa,
            logo_url: backendRecrutador.urlLogo,
            email_verificado: true,
            senha: '',
        };
    },

    getVagas: async (idRecrutador: number): Promise<Vaga[]> => {
        const response = await fetch(`${API_URL}/vaga/recrutador/${idRecrutador}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch vagas');
        const backendVagas = await response.json();
        return backendVagas.map((v: any) => ({
            id: v.idVaga.toString(),
            titulo: v.tituloVaga,
            setor_id: v.setor.idSetor.toString(),
            setor_nome: v.setor.nome,
            recrutador_id: v.idRecrutador.toString(),
            nivel: v.nivel.toLowerCase(),
            skills_obrigatorias: v.skills.filter((s: any) => s.nivel === 'OBRIGATORIA').map((s: any) => s.descricao),
            skills_desejaveis: v.skills.filter((s: any) => s.nivel === 'DESEJAVEL').map((s: any) => s.descricao),
            tempo_experiencia_minimo: v.expMin,
            descricao: v.descricao,
            ativa: v.status === 'ABERTA',
            createdAt: '',
        }));
    },

    getVagasPublicas: async (): Promise<Vaga[]> => {
        const response = await fetch(`${API_URL}/vaga/publicas`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch vagas publicas');
        const backendVagas = await response.json();
        return backendVagas.map((v: any) => ({
            id: v.idVaga.toString(),
            titulo: v.tituloVaga,
            setor_id: v.setor.idSetor.toString(),
            setor_nome: v.setor.nome,
            recrutador_id: v.idRecrutador.toString(),
            nivel: v.nivel.toLowerCase(),
            skills_obrigatorias: v.skills.filter((s: any) => s.nivel === 'OBRIGATORIA').map((s: any) => s.descricao),
            skills_desejaveis: v.skills.filter((s: any) => s.nivel === 'DESEJAVEL').map((s: any) => s.descricao),
            tempo_experiencia_minimo: v.expMin,
            descricao: v.descricao,
            ativa: v.status === 'ABERTA',
            createdAt: '',
        }));
    },

    getVaga: async (id: string): Promise<Vaga> => {
        const response = await fetch(`${API_URL}/vaga/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch vaga');
        const v = await response.json();
        return {
            id: v.idVaga.toString(),
            titulo: v.tituloVaga,
            setor_id: v.setor.idSetor.toString(),
            recrutador_id: v.idRecrutador.toString(),
            nivel: v.nivel.toLowerCase(),
            skills_obrigatorias: v.skills.filter((s: any) => s.nivel === 'OBRIGATORIA').map((s: any) => s.descricao),
            skills_desejaveis: v.skills.filter((s: any) => s.nivel === 'DESEJAVEL').map((s: any) => s.descricao),
            tempo_experiencia_minimo: v.expMin,
            descricao: v.descricao,
            ativa: v.status === 'ABERTA',
            createdAt: '',
        };
    },

    createVaga: async (data: Omit<Vaga, 'id' | 'createdAt'>): Promise<Vaga> => {
        const backendData = {
            tituloVaga: data.titulo,
            descricao: data.descricao,
            nivel: data.nivel.toUpperCase(),
            status: data.ativa ? 'ABERTA' : 'FECHADA',
            expMin: data.tempo_experiencia_minimo,
            idSetor: parseInt(data.setor_id),
            idRecrutador: parseInt(data.recrutador_id),
            skills: [
                ...data.skills_obrigatorias.map(s => ({ descricao: s, nivel: 'OBRIGATORIA' })),
                ...data.skills_desejaveis.map(s => ({ descricao: s, nivel: 'DESEJAVEL' }))
            ]
        };

        const response = await fetch(`${API_URL}/vaga`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(backendData),
        });
        if (!response.ok) throw new Error('Failed to create vaga');
        const v = await response.json();
        return {
            id: v.idVaga.toString(),
            titulo: v.tituloVaga,
            setor_id: v.setor.idSetor.toString(),
            recrutador_id: v.idRecrutador.toString(),
            nivel: v.nivel.toLowerCase(),
            skills_obrigatorias: v.skills.filter((s: any) => s.nivel === 'OBRIGATORIA').map((s: any) => s.descricao),
            skills_desejaveis: v.skills.filter((s: any) => s.nivel === 'DESEJAVEL').map((s: any) => s.descricao),
            tempo_experiencia_minimo: v.expMin,
            descricao: v.descricao,
            ativa: v.status === 'ABERTA',
            createdAt: '',
        };
    },

    updateVaga: async (id: number, data: Partial<Vaga>): Promise<Vaga> => {
        const backendData: any = {};
        if (data.titulo) backendData.tituloVaga = data.titulo;
        if (data.descricao) backendData.descricao = data.descricao;
        if (data.nivel) backendData.nivel = data.nivel.toUpperCase();
        if (data.ativa !== undefined) backendData.status = data.ativa ? 'ABERTA' : 'FECHADA';
        if (data.tempo_experiencia_minimo) backendData.expMin = data.tempo_experiencia_minimo;
        if (data.setor_id) backendData.idSetor = parseInt(data.setor_id);
        if (data.skills_obrigatorias || data.skills_desejaveis) {
            backendData.skills = [];
            if (data.skills_obrigatorias) {
                backendData.skills.push(...data.skills_obrigatorias.map(s => ({ descricao: s, nivel: 'OBRIGATORIA' })));
            }
            if (data.skills_desejaveis) {
                backendData.skills.push(...data.skills_desejaveis.map(s => ({ descricao: s, nivel: 'DESEJAVEL' })));
            }
        }

        const response = await fetch(`${API_URL}/vaga/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(backendData),
        });
        if (!response.ok) throw new Error('Failed to update vaga');
        return response.json();
    },

    deleteVaga: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/vaga/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete vaga');
    },

    getSetores: async (idRecrutador: number): Promise<Setor[]> => {
        const response = await fetch(`${API_URL}/setor/recrutador/${idRecrutador}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch setores');
        const backendSetores = await response.json();
        return backendSetores.map((s: any) => ({
            id: s.idSetor.toString(),
            nome: s.nome,
            createdAt: '',
        }));
    },

    createSetor: async (data: { nome: string; idRecrutador: number }): Promise<Setor> => {
        const response = await fetch(`${API_URL}/setor`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create setor');
        const s = await response.json();
        return {
            id: s.idSetor.toString(),
            nome: s.nome,
            createdAt: '',
        };
    },

    deleteSetor: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/setor/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete setor');
    },

    getCandidaturas: async (idRecrutador: number): Promise<Candidatura[]> => {
        const response = await fetch(`${API_URL}/candidatura/recrutador/${idRecrutador}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch candidaturas');
        const backendCandidaturas = await response.json();
        return backendCandidaturas.map((c: any) => {
            let status: 'muito_apto' | 'apto' | 'inapto' = 'inapto';
            if (c.apto === 'Muito apto') status = 'muito_apto';
            else if (c.apto === 'Apto') status = 'apto';
            else if (c.apto === 'Inapto') status = 'inapto';

            return {
                id: c.idCandidatura.toString(),
                vaga_id: c.idVaga?.toString() || '',
                nome: c.nomeCompleto,
                email: c.email,
                telefone: c.telefone || '',
                skills: c.skills?.map((s: any) => s.descricao) || [],
                tempo_experiencia: c.exp || 0,
                curriculo_url: c.urlCurriculo || '',
                status: status,
                createdAt: '',
            };
        });
    },

    createCandidatura: async (data: any): Promise<Candidatura> => {
        const response = await fetch(`${API_URL}/candidatura`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create candidatura');
        return response.json();
    },
};
