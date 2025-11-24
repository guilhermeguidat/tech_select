import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recrutador } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: Recrutador | null;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (email: string, senha: string, nome: string, nome_empresa: string, logo: File) => Promise<{ success: boolean; message: string }>;
  verificarEmail: (id: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Recrutador | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const data = await api.login({ email, senha });
      const { token, ...userData } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const register = async (email: string, senha: string, nome: string, nome_empresa: string, logo: File) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('senha', senha);
      formData.append('nomeCompleto', nome);
      formData.append('nomeEmpresa', nome_empresa);
      formData.append('urlLogo', logo);

      // Assuming for now we just send what we can.
      // If RecrutadorRequest requires MultipartFile, this might fail if we don't send it.

      const user = await api.register(formData);
      // Register doesn't return token usually, so we don't login automatically or we do?
      // api.register returns Recrutador.
      return { success: true, message: 'Cadastro realizado!' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Erro ao cadastrar.' };
    }
  };

  const verificarEmailUser = (id: string) => {
    // Not implemented in backend
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        verificarEmail: verificarEmailUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
