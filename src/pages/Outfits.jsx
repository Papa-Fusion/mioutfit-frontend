import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiUrl } from '../config/api';

function ModalEditarOutfit({ outfit, token, onGuardado, onCerrar }) {
  const [nombre, setNombre] = useState(outfit.nombre);
  const [descripcion, setDescripcion] = useState(outfit.descripcion || '');
  const [prendas, setPrendas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState(outfit.prendas.map(p => p.id));
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/prendas'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPrendas(data));
  }, [token]);

  const togglePrenda = (id) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await fetch(apiUrl(`/api/outfits/${outfit.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, descripcion, prendaIds: seleccionadas })
      });
      onGuardado();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest font-serif-moda">Editar Look</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-black text-2xl transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nombre del look</label>
              <input
                type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Descripción</label>
              <input
                type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Piezas seleccionadas
              </label>
              <span className="text-[10px] font-bold bg-black text-white px-2 py-1 tracking-widest">
                {seleccionadas.length} SELECCIONADAS
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {prendas.map(prenda => {
                const sel = seleccionadas.includes(prenda.id);
                return (
                  <div
                    key={prenda.id}
                    onClick={() => togglePrenda(prenda.id)}
                    className={`relative overflow-hidden cursor-pointer border transition-all ${
                      sel ? 'border-black transform scale-[0.98]' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="bg-gray-50 aspect-square flex items-center justify-center p-2">
                      <img
                        src={prenda.imagenUrl || 'https://placehold.co/120x100'}
                        alt={prenda.nombre}
                        className="w-full h-full object-contain"
                      />
                      {sel && (
                        <div className="absolute top-2 right-2 bg-black text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button" onClick={onCerrar}
              className="flex-1 py-4 border border-black text-black hover:bg-gray-50 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={cargando}
              className="flex-1 py-4 bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-60 transition-colors"
            >
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Outfits() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [outfitEditar, setOutfitEditar] = useState(null);

  const cargarOutfits = () => {
    fetch(apiUrl('/api/outfits'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOutfits(data);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarOutfits();
  }, [token]);

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este look de forma permanente?')) return;
    await fetch(apiUrl(`/api/outfits/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    cargarOutfits();
  };

  const handleGuardado = () => {
    setOutfitEditar(null);
    cargarOutfits();
  };

  const handleUsarOutfit = async (id) => {
    await fetch(apiUrl(`/api/outfits/${id}/usar`), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    cargarOutfits();
  };

  return (
    <Layout>
      {outfitEditar && (
        <ModalEditarOutfit
          outfit={outfitEditar}
          token={token}
          onGuardado={handleGuardado}
          onCerrar={() => setOutfitEditar(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif-moda">Looks Guardados</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Tu colección de {outfits.length} conjuntos listos para usar
          </p>
        </div>
        <button
          onClick={() => navigate('/armar-outfit')}
          className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
        >
          + Crear Look
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center mt-32">
          <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">Cargando colección...</p>
        </div>
      ) : outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-center">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-6">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-2xl font-serif-moda text-gray-900 mb-2">No tienes looks guardados</h2>
          <p className="text-gray-500 mb-8 max-w-sm">Combina tus prendas y guarda tus conjuntos favoritos para acceder a ellos rápidamente.</p>
          <button
            onClick={() => navigate('/armar-outfit')}
            className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Armar primer look
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {outfits.map(outfit => (
            <div key={outfit.id} className="bg-white border border-gray-200 group transition-all hover:border-gray-400 flex flex-col h-full relative">
              
              {/* Botones de acción flotantes (visibles en hover) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => setOutfitEditar(outfit)}
                  className="bg-white/90 backdrop-blur text-black p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white transition-colors text-xs"
                  title="Editar Look"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleEliminar(outfit.id)}
                  className="bg-white/90 backdrop-blur text-red-600 p-2 rounded-full border border-gray-200 hover:bg-red-600 hover:text-white transition-colors text-xs"
                  title="Eliminar Look"
                >
                  ✕
                </button>
              </div>

              {/* Encabezado del Look */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-base tracking-wide uppercase pr-16">{outfit.nombre}</h3>
                </div>
                {outfit.descripcion && (
                  <p className="text-xs text-gray-500 italic font-serif-moda">{outfit.descripcion}</p>
                )}
              </div>

              {/* Grilla de prendas */}
              <div className="p-6 flex-1">
                <div className="flex flex-wrap gap-3">
                  {outfit.prendas.map(prenda => (
                    <div key={prenda.id} className="flex flex-col items-center group/item cursor-pointer">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 flex items-center justify-center p-1 transition-transform group-hover/item:scale-110">
                        <img
                          src={prenda.imagenUrl || 'https://placehold.co/64x64'}
                          alt={prenda.nombre}
                          className="w-full h-full object-contain drop-shadow-sm"
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2 uppercase tracking-widest w-16 truncate text-center">
                        {prenda.tipo?.split(' ')[0] || prenda.categoria}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie de tarjeta: Estadísticas y Botón */}
              <div className="p-6 pt-0 mt-auto bg-white">
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                      <span className="text-black">{outfit.vecesUsado || 0}</span> USOS
                    </p>
                    {outfit.ultimoUso && (
                      <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">
                        Último: {new Date(outfit.ultimoUso).toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleUsarOutfit(outfit.id)}
                  className="w-full bg-transparent border border-black text-black hover:bg-black hover:text-white py-3 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Usar hoy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Outfits;