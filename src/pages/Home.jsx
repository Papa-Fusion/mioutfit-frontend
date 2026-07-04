import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiUrl } from '../config/api';

function PrendaCard({ prenda, onEliminar, onEditar, onUsar }) {
  return (
    <div className="bg-white overflow-hidden border border-gray-200 group transition-all hover:border-gray-400">
      <div className="relative bg-gray-50 aspect-[4/5] flex items-center justify-center">
        <img
          src={prenda.imagenUrl || 'https://placehold.co/220x200'}
          alt={prenda.nombre}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Botones de acción flotantes */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditar(prenda)}
            className="bg-white/90 backdrop-blur text-black p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white transition-colors text-xs"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onEliminar(prenda.id)}
            className="bg-white/90 backdrop-blur text-red-600 p-2 rounded-full border border-gray-200 hover:bg-red-600 hover:text-white transition-colors text-xs"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
        {prenda.vecesUsado > 0 && (
          <div className="absolute top-3 left-3 bg-white border border-gray-200 text-black text-[10px] px-2 py-1 uppercase tracking-widest font-semibold">
            {prenda.vecesUsado} USOS
          </div>
        )}
      </div>
      <div className="p-4 md:p-5 flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
          {prenda.categoria} {prenda.tipo && `· ${prenda.tipo}`}
        </span>
        <h3 className="font-bold text-gray-900 text-xs md:text-sm tracking-wide uppercase mb-2">{prenda.nombre}</h3>
        {prenda.color && (
          <p className="text-xs text-gray-500 mb-1">{prenda.color} · Talla {prenda.talla}</p>
        )}
        {prenda.ultimoUso && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-4">
            Último uso: {new Date(prenda.ultimoUso).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'short'
            })}
          </p>
        )}
        <button
          onClick={() => onUsar(prenda.id)}
          className="mt-auto w-full bg-transparent border border-black text-black hover:bg-black hover:text-white py-2 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Usar hoy
        </button>
      </div>
    </div>
  );
}

function ModalEditar({ prenda, token, onGuardado, onCerrar }) {
  const [form, setForm] = useState({ ...prenda });
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [cargando, setCargando] = useState(false);

  const TIPOS = {
    'Camiseta / Camisa': {
      categorias: ['Casual', 'Formal', 'Elegante'],
      tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    'Pantalón / Jean': {
      categorias: ['Casual', 'Formal', 'Elegante', 'Deportivo'],
      tallas: ['28', '30', '32', '34', '36', '38', '40']
    },
    'Zapatos / Calzado': {
      categorias: ['Casual', 'Formal', 'Elegante', 'Deportivo', 'Playero'],
      tallas: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
    },
    'Vestido / Falda': {
      categorias: ['Casual', 'Formal', 'Elegante', 'Playero'],
      tallas: ['XS', 'S', 'M', 'L', 'XL']
    },
    'Chaqueta / Abrigo': {
      categorias: ['Casual', 'Formal', 'Elegante', 'Deportivo'],
      tallas: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    'Accesorio': {
      categorias: ['Casual', 'Formal', 'Elegante', 'Deportivo'],
      tallas: ['Talla única']
    }
  };

  const tipoSeleccionado = TIPOS[form.tipo];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo') {
      setForm(prev => ({ ...prev, tipo: value, categoria: '', talla: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImagen = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendoImagen(true);
    try {
      const formData = new FormData();
      formData.append('file', archivo);
      const res = await fetch(apiUrl('/api/imagen/procesar'), {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al procesar imagen');
      const data = await res.json();
      setForm(prev => ({ ...prev, imagenUrl: data.secure_url }));
    } catch {
      alert('No se pudo procesar la imagen. Intenta de nuevo.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await fetch(apiUrl(`/api/prendas/${prenda.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      onGuardado();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-none border border-gray-200 w-full max-w-md p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Editar prenda</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-black text-2xl transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Tipo de prenda</label>
            <select
              name="tipo" value={form.tipo || ''} onChange={handleChange}
              className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent"
            >
              <option value="">Selecciona el tipo</option>
              {Object.keys(TIPOS).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
            <input
              type="text" name="nombre" value={form.nombre} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Categoría</label>
            <select
              name="categoria" value={form.categoria || ''} onChange={handleChange} required disabled={!tipoSeleccionado}
              className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:bg-gray-50"
            >
              <option value="">Selecciona</option>
              {tipoSeleccionado?.categorias.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Color</label>
              <input
                type="text" name="color" value={form.color || ''} onChange={handleChange}
                placeholder="Ej. Negro"
                className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Talla</label>
              <select
                name="talla" value={form.talla || ''} onChange={handleChange} required disabled={!tipoSeleccionado}
                className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:bg-gray-50"
              >
                <option value="">Selecciona</option>
                {tipoSeleccionado?.tallas.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Fotografía</label>
            <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 cursor-pointer p-6 hover:border-black transition-colors">
              {subiendoImagen ? (
                <p className="text-black text-xs font-bold tracking-widest uppercase">Subiendo...</p>
              ) : form.imagenUrl ? (
                <img src={form.imagenUrl} alt="Vista previa" className="w-full h-32 object-contain" />
              ) : (
                <p className="text-black text-xs font-bold tracking-widest uppercase">📷 Cambiar foto</p>
              )}
              <input type="file" accept="image/*" onChange={handleImagen} className="hidden" />
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button" onClick={onCerrar}
              className="flex-1 py-3 border border-black text-black hover:bg-gray-50 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={cargando}
              className="flex-1 py-3 bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-60 transition-colors"
            >
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [prendas, setPrendas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [prendaEditar, setPrendaEditar] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);

  const cargarPrendas = () => {
    fetch(apiUrl('/api/prendas'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPrendas(data);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarPrendas();
  }, [token]);

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta prenda?')) return;
    await fetch(apiUrl(`/api/prendas/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    cargarPrendas();
  };

  const handleGuardado = () => {
    setPrendaEditar(null);
    cargarPrendas();
  };

  const prendasFiltradas = prendas.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase());
    const coincideTipo = filtroTipo ? p.tipo === filtroTipo : true;
    const coincideCategoria = filtroCategoria ? p.categoria === filtroCategoria : true;
    return coincideBusqueda && coincideTipo && coincideCategoria;
  });

  const handleUsarPrenda = async (id) => {
    await fetch(apiUrl(`/api/prendas/${id}/usar`), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    cargarPrendas();
  };

  const hayFiltrosActivos = filtroTipo || filtroCategoria || filtroBusqueda;

  return (
    <Layout>
      {prendaEditar && (
        <ModalEditar
          prenda={prendaEditar}
          token={token}
          onGuardado={handleGuardado}
          onCerrar={() => setPrendaEditar(null)}
        />
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif">El Armario</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Mostrando {prendasFiltradas.length} de {prendas.length} piezas
          </p>
        </div>
        <button
          onClick={() => navigate('/agregar-prenda')}
          className="bg-black hover:bg-gray-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm w-full sm:w-auto"
        >
          + Nueva Pieza
        </button>
      </div>

      {/* Filtros — búsqueda siempre visible, dropdowns colapsables en mobile */}
      <div className="mb-8 space-y-3">
        {/* Fila 1: búsqueda + botón filtros (mobile) */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar pieza..."
            value={filtroBusqueda}
            onChange={e => setFiltroBusqueda(e.target.value)}
            className="flex-1 px-4 py-3 bg-transparent border-b border-gray-300 text-sm focus:outline-none focus:border-black placeholder-gray-400 transition-colors"
          />
          {/* Botón "Filtros" solo en mobile */}
          <button
            onClick={() => setFiltrosExpandidos(p => !p)}
            className={`sm:hidden flex items-center gap-2 px-4 py-2 border text-xs font-bold uppercase tracking-widest transition-colors ${
              hayFiltrosActivos ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
            }`}
          >
            ☰ Filtros {hayFiltrosActivos && '•'}
          </button>
        </div>

        {/* Fila 2: dropdowns — siempre visibles en sm+, colapsables en mobile */}
        <div className={`${filtrosExpandidos ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3`}>
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="flex-1 px-4 py-3 bg-transparent border-b border-gray-300 text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
          >
            <option value="">Todos los estilos</option>
            {['Camiseta / Camisa', 'Pantalón / Jean', 'Zapatos / Calzado', 'Vestido / Falda', 'Chaqueta / Abrigo', 'Accesorio'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="flex-1 px-4 py-3 bg-transparent border-b border-gray-300 text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {['Casual', 'Formal', 'Deportivo', 'Elegante', 'Playero'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {hayFiltrosActivos && (
            <button
              onClick={() => { setFiltroTipo(''); setFiltroCategoria(''); setFiltroBusqueda(''); }}
              className="px-4 py-3 text-xs text-gray-400 hover:text-black uppercase tracking-widest font-bold transition-colors whitespace-nowrap"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Estados */}
      {cargando ? (
        <div className="flex justify-center mt-32">
          <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">Cargando colección...</p>
        </div>
      ) : prendas.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center px-4">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-6">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-2">Tu armario está vacío</h2>
          <p className="text-gray-500 mb-8 max-w-sm">Comienza a construir tu colección digital agregando tu primera pieza de ropa.</p>
          <button
            onClick={() => navigate('/agregar-prenda')}
            className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Agregar primera pieza
          </button>
        </div>
      ) : prendasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          <p className="text-gray-900 font-serif text-xl mb-2">Sin resultados</p>
          <p className="text-gray-500 text-sm">No encontramos piezas con esos criterios.</p>
        </div>
      ) : (
        /* Grid: 2 col en mobile, 3 en md, 4 en lg */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {prendasFiltradas.map(prenda => (
            <PrendaCard
              key={prenda.id}
              prenda={prenda}
              onEliminar={handleEliminar}
              onEditar={setPrendaEditar}
              onUsar={handleUsarPrenda}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Home;