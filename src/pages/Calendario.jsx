import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { apiUrl } from '../config/api';

function Calendario() {
  const { token } = useAuth();
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [registros, setRegistros] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [outfitSeleccionado, setOutfitSeleccionado] = useState('');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);

  const nombresMes = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const cargarRegistros = () => {
    fetch(apiUrl(`/api/calendario?anio=${anio}&mes=${mes}`), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRegistros(data));
  };

  useEffect(() => {
    cargarRegistros();
  }, [anio, mes, token]);

  useEffect(() => {
    fetch(apiUrl('/api/outfits'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOutfits(data));
  }, [token]);

  const diasEnMes = new Date(anio, mes, 0).getDate();
  const primerDia = new Date(anio, mes - 1, 1).getDay();

  const getRegistroDia = (fecha) => registros.find(r => r.fecha === fecha);

  const handleDiaClick = (fecha) => {
    setDiaSeleccionado(fecha);
    const registro = getRegistroDia(fecha);
    if (registro) {
      setOutfitSeleccionado(registro.outfit.id);
      setNota(registro.notas || '');
    } else {
      setOutfitSeleccionado('');
      setNota('');
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await fetch(apiUrl('/api/calendario'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fecha: diaSeleccionado,
          outfitId: outfitSeleccionado,
          notas: nota
        })
      });
      cargarRegistros();
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    const registro = getRegistroDia(diaSeleccionado);
    if (!registro) return;
    try {
      await fetch(apiUrl(`/api/calendario/${registro.id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOutfitSeleccionado('');
      setNota('');
      cargarRegistros();
    } catch (error) {
      console.error(error);
    }
  };

  const mesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAnio(anio - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const mesSiguiente = () => {
    if (mes === 12) {
      setMes(1);
      setAnio(anio + 1);
    } else {
      setMes(mes + 1);
    }
  };

  // Encontrar el outfit completo seleccionado para mostrar sus prendas en la previsualización
  const outfitVisualizado = outfits.find(o => o.id.toString() === outfitSeleccionado.toString());

  return (
    <Layout>
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight font-serif-moda">Planificador</h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">Organiza tus looks semanales y mensuales con antelación</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA IZQUIERDA Y CENTRAL: El Calendario */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 md:p-8">
          
          {/* Cabecera del Calendario */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold tracking-widest uppercase font-serif-moda italic">
              {nombresMes[mes - 1]} <span className="text-gray-400 font-sans-moda font-normal not-italic">{anio}</span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={mesAnterior}
                className="px-3 py-2 border border-gray-300 text-xs font-bold hover:border-black transition-colors"
              >
                ◀
              </button>
              <button
                onClick={mesSiguiente}
                className="px-3 py-2 border border-gray-300 text-xs font-bold hover:border-black transition-colors"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-px text-center mb-2 border-b border-gray-100 pb-2">
            {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(d => (
              <span key={d} className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Cuadrícula de Celdas */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: primerDia }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-gray-50/40 border border-transparent"></div>
            ))}
            
            {Array.from({ length: diasEnMes }).map((_, index) => {
              const dia = index + 1;
              const fechaStr = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
              const tieneRegistro = getRegistroDia(fechaStr);
              const esHoy = fechaStr === `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
              const esSeleccionado = diaSeleccionado === fechaStr;

              return (
                <div
                  key={dia}
                  onClick={() => handleDiaClick(fechaStr)}
                  className={`aspect-square p-2 border cursor-pointer relative flex flex-col justify-between transition-all ${
                    esSeleccionado 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-100 hover:border-gray-400 bg-white'
                  }`}
                >
                  <span className={`text-xs font-bold ${esHoy ? 'text-black underline underline-offset-4' : 'text-gray-700'}`}>
                    {dia}
                  </span>
                  
                  {/* Indicador Minimalista de Look Asignado */}
                  {tieneRegistro && (
                    <div className="w-full flex justify-center pb-1">
                      <span className="text-[8px] bg-black text-white px-1.5 py-0.5 tracking-widest uppercase font-bold text-center scale-90 md:scale-100">
                        LOOK
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: Agenda del Día */}
        <div className="bg-white border border-gray-200 p-6 md:p-8 flex flex-col h-fit min-h-[500px]">
          
          {diaSeleccionado ? (
            <div className="flex flex-col h-full">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Agenda del día</p>
                <h3 className="font-bold text-gray-900 tracking-wide uppercase text-sm">
                  {new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long', day: 'numeric', month: 'long'
                  })}
                </h3>
              </div>

              <div className="space-y-6 flex-1">
                {/* Selector de Outfit */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Seleccionar Look
                  </label>
                  <select
                    value={outfitSeleccionado}
                    onChange={(e) => setOutfitSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent"
                  >
                    <option value="">Sin look asignado</option>
                    {outfits.map(o => (
                      <option key={o.id} value={o.id}>{o.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Previsualización del Outfit Seleccionado (Minis) */}
                {outfitVisualizado && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {outfitVisualizado.prendas?.map(prenda => (
                      <div key={prenda.id} className="w-12 h-12 bg-gray-50 border border-gray-100 flex items-center justify-center p-1" title={prenda.nombre}>
                        <img 
                          src={prenda.imagenUrl || 'https://placehold.co/50x50'} 
                          alt={prenda.nombre} 
                          className="w-full h-full object-contain drop-shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Notas */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Notas adicionales
                  </label>
                  <input
                    type="text"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej. Llevar abrigo extra"
                    className="w-full px-4 py-3 rounded-none border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-transparent"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-8 space-y-3 pt-6 border-t border-gray-100">
                <button
                  onClick={handleGuardar}
                  disabled={!outfitSeleccionado || guardando}
                  className="w-full bg-black hover:bg-gray-900 text-white py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60 transition-colors"
                >
                  {guardando ? 'Guardando...' : 'Guardar en agenda'}
                </button>

                {getRegistroDia(diaSeleccionado) && (
                  <button
                    onClick={handleEliminar}
                    className="w-full bg-transparent border border-red-200 text-red-600 hover:bg-red-50 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Quitar de la agenda
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center flex-1">
              <p className="text-gray-900 font-serif-moda text-xl mb-2">Selecciona una fecha</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest max-w-[200px]">
                Haz clic en cualquier día del calendario para organizar tu estilo
              </p>
            </div>
          )}
          
        </div>
      </div>
    </Layout>
  );
}

export default Calendario;