import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string;
  adminId: string;
  login: (user: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_PASS = "Andys.27#";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('me_saas_auth') === 'true';
  });
  const [adminName, setAdminName] = useState<string>(() => {
    return localStorage.getItem('me_saas_admin_name') || 'Administrador';
  });
  const [adminId, setAdminId] = useState<string>(() => {
    return localStorage.getItem('me_saas_admin_id') || '';
  });

  const login = async (userIn: string, passIn: string) => {
    const trimmedUser = userIn.trim();
    const trimmedPass = passIn.trim();

    try {
      // 1. Verificación en tabla usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('Usuario', trimmedUser)
        .eq('Clave', trimmedPass);

      if (!error && data && data.length > 0) {
        const adminUser = data[0];
        const name = adminUser.nombre || trimmedUser;
        const id = adminUser.id || '';
        setIsAuthenticated(true);
        setAdminName(name);
        setAdminId(id);
        localStorage.setItem('me_saas_auth', 'true');
        localStorage.setItem('me_saas_admin_name', name);
        localStorage.setItem('me_saas_admin_id', id);
        return { success: true };
      }

      // 2. Verificación de respaldo con contraseña maestra
      if (trimmedPass === MASTER_PASS && (trimmedUser.toLowerCase().includes('admin') || trimmedUser.toLowerCase().includes('andy'))) {
        setIsAuthenticated(true);
        setAdminName(trimmedUser || 'Andys Admin');
        localStorage.setItem('me_saas_auth', 'true');
        localStorage.setItem('me_saas_admin_name', trimmedUser || 'Andys Admin');
        return { success: true };
      }

      return { success: false, message: 'Usuario o contraseña incorrectos' };
    } catch (err: any) {
      console.error('Error de autenticación:', err);
      return { success: false, message: 'Error de conexión al validar credenciales' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminName('Administrador');
    setAdminId('');
    localStorage.removeItem('me_saas_auth');
    localStorage.removeItem('me_saas_admin_name');
    localStorage.removeItem('me_saas_admin_id');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminName, adminId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de AuthProvider');
  return context;
};
