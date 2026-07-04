import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/api';

function Registro() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/auth/registro'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      if (!response.ok) throw new Error();
      navigate('/');
    } catch {
      setError('No se pudo completar el registro. Intente de nuevo.');
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
            Crear Cuenta
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-2 font-medium">
            Únete a la plataforma de organización de estilos
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              placeholder="Ej. Alexander McQueen"
              className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
            />
          </div>

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
              {cargando ? 'Creando Cuenta...' : 'Registrar Cuenta'}
            </button>
          </div>
        </form>

        {/* Enlace de Navegación */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            ¿Ya eres miembro?{' '}
            <span
              onClick={() => navigate('/')}
              className="text-black font-bold cursor-pointer underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              Inicia sesión aquí
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Registro;