import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiUrl } from '../config/api';  // ← único cambio de import

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

function AgregarPrenda() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [prenda, setPrenda] = useState({
    nombre: '', tipo: '', categoria: '', color: '', talla: '', imagenUrl: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const tipoSeleccionado = TIPOS[prenda.tipo];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo') {
      setPrenda(prev => ({ ...prev, tipo: value, categoria: '', talla: '' }));
    } else {
      setPrenda(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImagen = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB. Intenta con una más pequeña.');
      return;
    }
    setSubiendoImagen(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', archivo);
      const res = await fetch(apiUrl('/api/imagen/procesar'), {  // ← antes: 'http://localhost:8080/api/imagen/procesar'
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al procesar imagen');
      const data = await res.json();
      setPrenda(prev => ({ ...prev, imagenUrl: data.secure_url }));
    } catch {
      setError('No se pudo procesar la imagen. Intenta de nuevo.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prenda.imagenUrl) {
      setError('Debes subir una foto de la prenda');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/prendas'), {  // ← antes: 'http://localhost:8080/api/prendas'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prenda)
      });
      if (!response.ok) throw new Error('Error al guardar');
      navigate('/home');
    } catch {
      setError('No se pudo guardar la prenda. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Layout>
      <div className="border-b border-gray-200 pb-6 mb-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif-moda">Nueva Pieza</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Añade un nuevo artículo a tu colección digital</p>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-8 md:p-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-3 mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Tipo de prenda</label>
              <select
                name="tipo" value={prenda.tipo} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
              >
                <option value="">Selecciona el tipo</option>
                {Object.keys(TIPOS).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
              <input
                type="text" name="nombre" value={prenda.nombre} onChange={handleChange} required
                placeholder="Ej. Camiseta básica de algodón"
                className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Estilo / Categoría</label>
              <select
                name="categoria" value={prenda.categoria} onChange={handleChange} required disabled={!tipoSeleccionado}
                className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:bg-gray-50 bg-transparent transition-colors"
              >
                <option value="">Selecciona</option>
                {tipoSeleccionado?.categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Color</label>
              <input
                type="text" name="color" value={prenda.color} onChange={handleChange} required placeholder="Ej. Blanco"
                className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Talla</label>
              <select
                name="talla" value={prenda.talla} onChange={handleChange} required disabled={!tipoSeleccionado}
                className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 disabled:bg-gray-50 bg-transparent transition-colors"
              >
                <option value="">Selecciona</option>
                {tipoSeleccionado?.tallas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Fotografía de la pieza</label>
            <label className="flex flex-col items-center justify-center border border-dashed border-gray-400 p-10 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
              {subiendoImagen ? (
                <p className="text-black text-xs font-bold tracking-widest uppercase animate-pulse">Procesando imagen...</p>
              ) : prenda.imagenUrl ? (
                <img src={prenda.imagenUrl} alt="Vista previa" className="w-full max-h-[300px] object-contain" />
              ) : (
                <div className="text-center">
                  <span className="text-2xl mb-3 block">📷</span>
                  <p className="text-black text-xs font-bold tracking-widest uppercase">Seleccionar Fotografía</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">Fondo blanco recomendado</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImagen} className="hidden" />
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit" disabled={cargando || subiendoImagen}
              className="w-full bg-black hover:bg-gray-900 text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-60"
            >
              {cargando ? 'Añadiendo pieza...' : 'Agregar al armario'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AgregarPrenda;