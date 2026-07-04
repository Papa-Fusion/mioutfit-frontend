import { API_URL } from '../config/api';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario') || 'null')
  );

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Credenciales incorrectas');

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);

    // Cargar perfil del usuario
    const perfilRes = await fetch(`${API_URL}/api/perfil`, {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    const perfil = await perfilRes.json();
    localStorage.setItem('usuario', JSON.stringify(perfil));
    setUsuario(perfil);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  const actualizarUsuario = (nuevosDatos) => {
    const actualizado = { ...usuario, ...nuevosDatos };
    localStorage.setItem('usuario', JSON.stringify(actualizado));
    setUsuario(actualizado);
  };

  // Escuchar un evento global personalizado para desautenticar si el token expira
  useEffect(() => {
    const manejarSesionExpirada = () => {
      console.warn("La sesión ha expirado o es inválida. Cerrando sesión...");
      logout();
    };

    window.addEventListener('sesion-expirada', manejarSesionExpirada);
    return () => {
      window.removeEventListener('sesion-expirada', manejarSesionExpirada);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}