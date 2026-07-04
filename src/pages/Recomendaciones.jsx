import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiUrl } from '../config/api';  // ← único cambio de import

function getClimaInfo(temp) {
  if (temp >= 28) return { label: 'Muy caluroso', icono: '☀️', categoria: 'Playero' };
  if (temp >= 22) return { label: 'Caluroso', icono: '🌤️', categoria: 'Casual' };
  if (temp >= 15) return { label: 'Templado', icono: '🌥️', categoria: 'Casual' };
  if (temp >= 8)  return { label: 'Fresco', icono: '🧥', categoria: 'Formal' };
  return { label: 'Frío', icono: '🥶', categoria: 'Deportivo' };
}

function Recomendaciones() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [clima, setClima] = useState(null);
  const [ciudad, setCiudad] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const resClima = await fetch(apiUrl(`/api/clima?lat=${lat}&lon=${lon}`), {  // ← antes: 'http://localhost:8080/api/clima?...'
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resClima.ok) throw new Error('Error al obtener clima');
        const dataClima = await resClima.json();

        setCiudad(dataClima.name);
        const temp = dataClima.main.temp;
        const infoClima = getClimaInfo(temp);
        setClima({ ...infoClima, temp: Math.round(temp) });

        const resOutfits = await fetch(apiUrl('/api/outfits'), {  // ← antes: 'http://localhost:8080/api/outfits'
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resOutfits.ok) {
          const outfitsData = await resOutfits.json();
          const filtrados = outfitsData.filter(outfit =>
            outfit.prendas.some(p => p.categoria === infoClima.categoria)
          );
          setRecomendaciones(filtrados.length > 0 ? filtrados : outfitsData.slice(0, 3));
        }
      } catch {
        setError('No pudimos acceder a los datos del clima en este momento.');
      } finally {
        setCargando(false);
      }
    }, () => {
      setError('Necesitamos acceso a tu ubicación para recomendarte qué vestir hoy.');
      setCargando(false);
    });
  }, [token]);

  return (
    <Layout>
      <div className="border-b border-gray-200 pb-6 mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif-moda">Sugerencias del Día</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Curaduría de estilo basada en tu entorno</p>
      </div>

      <div className="max-w-5xl mx-auto">
        {cargando ? (
          <div className="bg-gray-50 border border-gray-200 p-8 flex justify-center items-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Analizando el clima local...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 p-8 text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</p>
          </div>
        ) : clima && (
          <div className="bg-black text-white p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Ubicación actual</p>
              <h2 className="text-3xl font-serif-moda uppercase tracking-widest">{ciudad}</h2>
            </div>
            <div className="text-center md:text-right mt-6 md:mt-0 border-t md:border-t-0 md:border-l border-gray-800 pt-6 md:pt-0 md:pl-10">
              <div className="flex items-center justify-center md:justify-end gap-4 mb-2">
                <span className="text-4xl">{clima.icono}</span>
                <span className="text-5xl font-light tracking-tighter">{clima.temp}°C</span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-3">
                Pronóstico: <span className="text-white font-bold">{clima.label}</span>
              </p>
            </div>
          </div>
        )}

        {!cargando && !error && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-200 pb-3">
              Looks recomendados para hoy
            </h3>
            {recomendaciones.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200">
                <p className="text-xs text-gray-400 uppercase tracking-widest">No hay looks armados para este clima.</p>
                <button
                  onClick={() => navigate('/armar-outfit')}
                  className="mt-6 border border-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                  Crear un Look {clima?.categoria}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recomendaciones.map(rec => (
                  <div key={rec.id} className="bg-white border border-gray-200 p-6 group hover:border-black transition-colors">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs truncate">{rec.nombre}</h4>
                      <span className="text-[9px] bg-gray-100 text-black px-2 py-1 font-bold uppercase tracking-widest">
                        {clima.categoria}
                      </span>
                    </div>
                    <div className="flex justify-center gap-4 mb-8">
                      {rec.prendas.slice(0, 3).map(prenda => (
                        <div key={prenda.id} className="text-center">
                          <div className="w-20 h-20 bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                            <img
                              src={prenda.imagenUrl}
                              alt={prenda.nombre}
                              className="w-16 h-16 object-contain mix-blend-multiply"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/calendario')}
                      className="w-full bg-white border border-gray-200 text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                    >
                      Programar Uso
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Recomendaciones;