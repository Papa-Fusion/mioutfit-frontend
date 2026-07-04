import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { apiUrl } from '../config/api';

function Perfil() {
  const { token, usuario, actualizarUsuario } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendoFoto(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', archivo);

      // Usamos el endpoint seguro del backend, igual que en AgregarPrenda
      const res = await fetch(apiUrl('/api/imagen/procesar'), {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Error al procesar imagen');
      
      const data = await res.json();
      const imageUrl = data.secure_url;

      // Actualizamos la URL en el backend
      const updateRes = await fetch(apiUrl('/api/perfil'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fotoUrl: imageUrl })
      });

      if (!updateRes.ok) throw new Error('Error al actualizar perfil');

      const usuarioActualizado = await updateRes.json();
      actualizarUsuario(usuarioActualizado);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      setError('No se pudo actualizar la foto de perfil.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setExito(false);

    try {
      const res = await fetch(apiUrl('/api/perfil'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre })
      });

      if (!res.ok) throw new Error('Error al actualizar nombre');

      const usuarioActualizado = await res.json();
      actualizarUsuario(usuarioActualizado);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (error) {
      setError('No se pudo guardar la información.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Layout>
      <div className="border-b border-gray-200 pb-6 mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif-moda">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Gestiona tu identidad digital</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white border border-gray-200 p-8 md:p-12">
        
        {/* Fotografía de Perfil */}
        <div className="flex flex-col items-center mb-10 pb-10 border-b border-gray-100">
          <div className="relative group cursor-pointer mb-4">
            {subiendoFoto ? (
              <div className="w-32 h-32 rounded-none bg-gray-50 border border-gray-200 flex items-center justify-center">
                <p className="text-[9px] uppercase tracking-widest text-black animate-pulse font-bold">Procesando...</p>
              </div>
            ) : usuario?.fotoUrl ? (
              <div className="w-32 h-32 relative">
                <img
                  src={usuario.fotoUrl}
                  alt={usuario.nombre}
                  className="w-full h-full object-cover border border-gray-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[10px] uppercase tracking-widest font-bold">Cambiar</span>
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-none bg-black text-white flex items-center justify-center border border-black group-hover:bg-gray-900 transition-colors">
                <span className="text-4xl font-serif-moda">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFoto}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={subiendoFoto}
            />
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Fotografía de perfil
          </p>
        </div>

        {/* Notificaciones */}
        {exito && (
          <div className="bg-black text-white text-xs font-bold uppercase tracking-widest px-4 py-3 mb-8 text-center shadow-sm">
            Cambios guardados con éxito
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-3 mb-8 text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleGuardar} className="space-y-8">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Nombre completo
            </label>
            <input
              type="text" value={nombre}
              onChange={e => setNombre(e.target.value)} required
              className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Correo electrónico
            </label>
            <input
              type="email" value={usuario?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-none border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">
              El correo electrónico no puede ser modificado
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit" disabled={guardando}
              className="w-full bg-black hover:bg-gray-900 text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-60"
            >
              {guardando ? 'Actualizando perfil...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default Perfil;