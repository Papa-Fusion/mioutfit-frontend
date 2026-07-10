import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login, loginConGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  useEffect(() => {
    // Cargar el script de Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        }
      );
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleGoogleCallback = async (response) => {
    setCargandoGoogle(true);
    setError('');
    try {
      await loginConGoogle(response.credential);
      navigate('/home');
    } catch {
      setError('No se pudo iniciar sesión con Google. Intenta de nuevo.');
    } finally {
      setCargandoGoogle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      await login(email, password);
      navigate('/home');
    } catch {
      setError('Credenciales incorrectas. Intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 md:p-10 shadow-sm">

        {/* Cabecera / Marca */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-black uppercase tracking-widest font-serif-moda">
            Mi Outfit
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-2 font-medium">
            Colección Digital & Guardarropa Personal
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Botón Google */}
        <div className="mb-6">
          {cargandoGoogle ? (
            <div className="w-full border border-gray-300 py-3 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
              <span className="animate-pulse">Conectando con Google...</span>
            </div>
          ) : (
            <div id="google-btn" className="w-full flex justify-center" />
          )}
        </div>

        {/* Separador */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">o</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Formulario email/password */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="nombre@ejemplo.com"
              className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-black hover:bg-gray-900 text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-60"
            >
              {cargando ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        {/* Enlace de Navegación */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            ¿No tienes una cuenta aún?{' '}
            <span
              onClick={() => navigate('/registro')}
              className="text-black font-bold cursor-pointer underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              Regístrate aquí
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;