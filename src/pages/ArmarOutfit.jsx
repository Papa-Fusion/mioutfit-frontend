import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Maniqui from '../components/Maniqui';
import { apiUrl } from '../config/api';

function ArmarOutfit() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [prendas, setPrendas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  // En mobile el maniquí puede mostrarse u ocultarse para no ocupar espacio
  const [mostrarManiqui, setMostrarManiqui] = useState(false);

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

  const obtenerPrendasParaManiqui = () => {
    const prendasManiqui = {};
    seleccionadas.forEach(id => {
      const prenda = prendas.find(p => p.id === id);
      if (prenda && prenda.tipo) {
        const tipoStr = prenda.tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (tipoStr.includes('camis') || tipoStr.includes('vestido') || tipoStr.includes('torso')) {
          prendasManiqui.torso = prenda;
        } else if (tipoStr.includes('pantal') || tipoStr.includes('jean') || tipoStr.includes('fald')) {
          prendasManiqui.piernas = prenda;
        } else if (tipoStr.includes('chaquet') || tipoStr.includes('abrig')) {
          prendasManiqui.chaqueta = prenda;
        } else if (tipoStr.includes('zapat') || tipoStr.includes('calzad')) {
          prendasManiqui.calzado = prenda;
        } else if (tipoStr.includes('accesor')) {
          prendasManiqui.accesorio = prenda;
        }
      }
    });
    return prendasManiqui;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (seleccionadas.length === 0) {
      setError('Selecciona al menos una prenda para el look');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/outfits'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, descripcion, prendaIds: seleccionadas })
      });
      if (!response.ok) throw new Error();
      navigate('/outfits');
    } catch {
      setError('No se pudo guardar el outfit. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Layout>
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif-moda">Armar Look</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Combina tus piezas para crear el conjunto perfecto</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Botón "Ver en maniquí" visible solo en mobile cuando hay prendas seleccionadas */}
      {seleccionadas.length > 0 && (
        <button
          onClick={() => setMostrarManiqui(p => !p)}
          className="lg:hidden w-full mb-6 flex items-center justify-center gap-2 py-3 border border-black text-black text-xs font-bold uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
        >
          {mostrarManiqui ? '✕ Ocultar maniquí' : `👗 Ver en maniquí (${seleccionadas.length} prendas)`}
        </button>
      )}

      {/* Maniquí colapsable en mobile */}
      {mostrarManiqui && (
        <div className="lg:hidden mb-6">
          <Maniqui prendasSeleccionadas={obtenerPrendasParaManiqui()} />
        </div>
      )}

      {/* Layout principal: dos columnas en lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

        {/* COLUMNA IZQUIERDA: Formulario y Selección */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Datos del look */}
            <div className="bg-white border border-gray-200 p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Nombre del look
                </label>
                <input
                  type="text" value={nombre}
                  onChange={e => setNombre(e.target.value)} required
                  placeholder="Ej: Look casual de fin de semana"
                  className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Descripción (Opcional)
                </label>
                <input
                  type="text" value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: Ideal para un día cálido"
                  className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
                />
              </div>
            </div>

            {/* Selección de prendas */}
            <div className="bg-white border border-gray-200 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-widest">
                  Seleccionar piezas
                </p>
                <span className="text-[10px] font-bold bg-black text-white px-2 py-1 tracking-widest">
                  {seleccionadas.length} SELECCIONADAS
                </span>
              </div>

              {/* 2 columnas en mobile, 3 en sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-h-[400px] overflow-y-auto pr-1">
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
                      <div className="bg-gray-50 aspect-square flex items-center justify-center p-2 relative">
                        <img
                          src={prenda.imagenUrl || 'https://placehold.co/120x100'}
                          alt={prenda.nombre}
                          className="w-full h-full object-contain"
                        />
                        {sel && (
                          <div className="absolute top-2 right-2 bg-black text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-2 md:p-3 bg-white border-t border-gray-100 text-center">
                        <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-0.5 truncate">{prenda.categoria}</p>
                        <p className="text-[10px] md:text-xs font-bold text-gray-900 uppercase tracking-wide truncate">{prenda.nombre}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit" disabled={cargando}
              className="w-full bg-black hover:bg-gray-900 text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-60"
            >
              {cargando ? 'Guardando Look...' : 'Guardar Look'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Maniquí — solo visible en lg+ (en mobile ya está el botón de arriba) */}
        <div className="hidden lg:block sticky top-6 h-fit">
          <Maniqui prendasSeleccionadas={obtenerPrendasParaManiqui()} />
        </div>

      </div>
    </Layout>
  );
}

export default ArmarOutfit;