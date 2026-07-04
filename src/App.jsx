import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Registro from './pages/Registro';
import AgregarPrenda from './pages/AgregarPrenda';
import ArmarOutfit from './pages/ArmarOutfit';
import Outfits from './pages/Outfits';
import Recomendaciones from './pages/Recomendaciones';
import Perfil from './pages/Perfil';
import Calendario from './pages/Calendario';

function RutaProtegida({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

// Configuración del Interceptor Global para Fetch Nativo
function InterceptorDeSesion({ children }) {
  useEffect(() => {
    const { fetch: originalFetch } = window;

    // Sobrescribimos el fetch global de la ventana del navegador
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Si el backend responde 401 (No autorizado) o 403 (Prohibido/Token Expirado)
        if (response.status === 401 || response.status === 403) {
          // Disparamos el evento para que AuthContext limpie el estado
          window.dispatchEvent(new Event('sesion-expirada'));
        }
        
        return response;
      } catch (error) {
        // Manejo secundario si hay errores de red de bajo nivel
        return Promise.reject(error);
      }
    };

    // Restaurar el fetch original al desmontar el componente si fuera necesario
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return children;
}

function App() {
  return (
    <AuthProvider>
      <InterceptorDeSesion>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/home" element={
              <RutaProtegida>
                <Home />
              </RutaProtegida>
            } />
            <Route path="/agregar-prenda" element={
              <RutaProtegida>
                <AgregarPrenda />
              </RutaProtegida>
            } />
            <Route path="/outfits" element={
              <RutaProtegida><Outfits /></RutaProtegida>
            } />
            <Route path="/armar-outfit" element={
              <RutaProtegida><ArmarOutfit /></RutaProtegida>
            } />
            <Route path="/recomendaciones" element={
              <RutaProtegida><Recomendaciones /></RutaProtegida>
            } />
            <Route path="/perfil" element={
              <RutaProtegida><Perfil /></RutaProtegida>
            } />
            <Route path="/calendario" element={
              <RutaProtegida><Calendario /></RutaProtegida>
            } />
            {/* Redirección por defecto si la ruta no existe */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </InterceptorDeSesion>
    </AuthProvider>
  );
}

export default App;