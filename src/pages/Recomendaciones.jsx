import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiUrl } from '../config/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORIAS = ['Casual', 'Formal', 'Elegante', 'Deportivo', 'Playero', 'Urbano', 'Bohemio', 'Ejecutivo', 'Noche/Fiesta'];

function getClimaInfo(temp) {
  if (temp >= 28) return { label: 'Muy caluroso', icono: '☀️', categoria: 'Playero' };
  if (temp >= 22) return { label: 'Caluroso', icono: '🌤️', categoria: 'Casual' };
  if (temp >= 15) return { label: 'Templado', icono: '🌥️', categoria: 'Casual' };
  if (temp >= 8)  return { label: 'Fresco', icono: '🧥', categoria: 'Formal' };
  return { label: 'Frío', icono: '🥶', categoria: 'Deportivo' };
}

function MapClickHandler({ onUbicacionSeleccionada }) {
  useMapEvents({
    click(e) {
      onUbicacionSeleccionada(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function Recomendaciones() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [combinaciones, setCombinaciones] = useState([]);
  const [clima, setClima] = useState(null);
  const [climaLabel, setClimaLabel] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoMapa, setCargandoMapa] = useState(false);
  const [cargandoCombinaciones, setCargandoCombinaciones] = useState(false);
  const [error, setError] = useState('');
  const [coordenadas, setCoordenadas] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const obtenerCombinaciones = useCallback(async (climaLabelParam, categoria = '') => {
    setCargandoCombinaciones(true);
    try {
      const params = new URLSearchParams({ clima: climaLabelParam });
      if (categoria) params.append('categoria', categoria);

      const res = await fetch(apiUrl(`/api/recomendaciones/combinar?${params}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const parsed = JSON.parse(data.combinaciones);
      setCombinaciones(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCombinaciones([]);
    } finally {
      setCargandoCombinaciones(false);
    }
  }, [token]);

  const obtenerClima = useCallback(async (lat, lon) => {
    setCargandoMapa(true);
    setError('');
    try {
      const resClima = await fetch(apiUrl(`/api/clima?lat=${lat}&lon=${lon}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resClima.ok) throw new Error('Error al obtener clima');
      const dataClima = await resClima.json();

      setCiudad(dataClima.name);
      const temp = dataClima.main.temp;
      const infoClima = getClimaInfo(temp);
      const label = `${infoClima.label} (${Math.round(temp)}°C)`;
      setClima({ ...infoClima, temp: Math.round(temp) });
      setClimaLabel(label);
      // Al cambiar ubicación, resetear el filtro de categoría
      setCategoriaFiltro('');

      const resOutfits = await fetch(apiUrl('/api/outfits'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resOutfits.ok) {
        const outfitsData = await resOutfits.json();
        const filtrados = outfitsData.filter(outfit =>
          outfit.prendas.some(p => p.categoria === infoClima.categoria)
        );
        setRecomendaciones(filtrados.length > 0 ? filtrados : outfitsData.slice(0, 3));
      }

      await obtenerCombinaciones(label, '');

    } catch {
      setError('No pudimos obtener el clima para esa ubicación.');
    } finally {
      setCargandoMapa(false);
      setCargando(false);
      setMostrarMapa(false);
    }
  }, [token, obtenerCombinaciones]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoordenadas({ lat, lon });
        obtenerClima(lat, lon);
      },
      () => {
        setCoordenadas({ lat: 4.5709, lon: -74.2973 });
        setError('Activa la ubicación o selecciona un lugar en el mapa.');
        setCargando(false);
      }
    );
  }, [obtenerClima]);

  // Rellamar a Gemini cuando el usuario cambia la categoría
  useEffect(() => {
    if (climaLabel) {
      obtenerCombinaciones(climaLabel, categoriaFiltro);
    }
  }, [categoriaFiltro]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUbicacionSeleccionada = (lat, lon) => {
    setCoordenadas({ lat, lon });
    obtenerClima(lat, lon);
  };

  return (
    <Layout>
      <div className="border-b border-gray-200 pb-6 mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif-moda">Sugerencias del Día</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Curaduría de estilo basada en tu entorno</p>
      </div>

      <div className="max-w-5xl mx-auto">

        {/* Banner del Clima */}
        {cargando ? (
          <div className="bg-gray-50 border border-gray-200 p-8 flex justify-center items-center mb-6">
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Analizando el clima local...</p>
          </div>
        ) : clima && (
          <div className="bg-black text-white p-8 md:p-12 mb-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Ubicación actual</p>
              <h2 className="text-3xl font-serif-moda uppercase tracking-widest">
                {cargandoMapa ? <span className="animate-pulse text-gray-400">Cargando...</span> : ciudad}
              </h2>
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

        {/* Botón mapa */}
        {!cargando && (
          <button
            onClick={() => setMostrarMapa(p => !p)}
            className="w-full mb-6 flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-600 hover:border-black hover:text-black text-xs font-bold uppercase tracking-widest transition-colors"
          >
            {mostrarMapa ? '✕ Cerrar mapa' : '🗺️ Seleccionar otra ubicación'}
          </button>
        )}

        {/* Mapa interactivo */}
        {mostrarMapa && coordenadas && (
          <div className="mb-8 border border-gray-200">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Toca cualquier lugar del mapa para ver el clima de esa zona
              </p>
            </div>
            <div style={{ height: '380px', width: '100%' }}>
              <MapContainer
                center={[coordenadas.lat, coordenadas.lon]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[coordenadas.lat, coordenadas.lon]} />
                <MapClickHandler onUbicacionSeleccionada={handleUbicacionSeleccionada} />
              </MapContainer>
            </div>
            {cargandoMapa && (
              <div className="bg-black text-white text-center py-3">
                <p className="text-[10px] uppercase tracking-widest animate-pulse font-bold">Obteniendo clima...</p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && !clima && (
          <div className="bg-white border border-gray-200 p-8 text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</p>
          </div>
        )}

        {/* SECCIÓN GEMINI: Combinaciones sugeridas */}
        {!cargando && clima && (
          <div className="mb-12">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                ✦ Combina tus prendas
              </h3>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                Sugerido por IA
              </span>
            </div>

            {/* Selector de categoría */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setCategoriaFiltro('')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors
                  ${categoriaFiltro === ''
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'}`}
              >
                Todas
              </button>
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-colors
                    ${categoriaFiltro === cat
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {cargandoCombinaciones ? (
              <div className="bg-gray-50 border border-gray-100 p-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 animate-pulse">
                  Analizando tu armario...
                </p>
              </div>
            ) : combinaciones.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 p-8 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  {categoriaFiltro
                    ? `No encontramos prendas de estilo ${categoriaFiltro} para combinar.`
                    : 'Agrega más prendas para recibir sugerencias de combinación.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {combinaciones.map((combo, index) => (
                  <div key={index} className="bg-white border border-gray-200 p-5 hover:border-gray-400 transition-colors">
                    <div className="mb-4 pb-3 border-b border-gray-100">
                      <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-1">
                        {combo.nombre}
                      </h4>
                      <p className="text-[10px] text-gray-500 italic leading-relaxed">
                        {combo.motivo}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {combo.prendas?.map((prenda, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-50 border border-gray-100 flex items-center justify-center p-1">
                            {prenda.imagenUrl ? (
                              <img
                                src={prenda.imagenUrl}
                                alt={prenda.nombre}
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <span className="text-gray-300 text-xs">📷</span>
                            )}
                          </div>
                          <p className="text-[8px] text-gray-400 uppercase tracking-wide mt-1 w-16 truncate text-center">
                            {prenda.tipo?.split('/')[0]?.trim() || prenda.nombre}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/armar-outfit')}
                      className="w-full border border-gray-300 text-gray-600 hover:border-black hover:text-black py-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      + Guardar como look
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN: Looks guardados recomendados */}
        {!cargando && clima && !cargandoMapa && (
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