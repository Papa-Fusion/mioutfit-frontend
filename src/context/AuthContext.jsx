import { API_URL } from '../config/api';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario') || 'null')
  );

  const _finalizarLogin = async (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);

    const perfilRes = await fetch(`${API_URL}/api/perfil`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const perfil = await perfilRes.json();
    localStorage.setItem('usuario', JSON.stringify(perfil));
    setUsuario(perfil);
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Credenciales incorrectas');

    const data = await response.json();
    await _finalizarLogin(data.token);
  };

  const loginConGoogle = async (idToken) => {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) throw new Error('Error al iniciar sesión con Google');

    const data = await response.json();
    await _finalizarLogin(data.token);
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
    <AuthContext.Provider value={{ token, usuario, login, loginConGoogle, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}