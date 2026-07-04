import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';

export default function Maniqui({ prendasSeleccionadas = {}, alGuardarOutfit }) {
  const [genero, setGenero] = useState('femenino');
  const dressingAreaRef = useRef(null);

  // Z-index para asegurar que las capas se superpongan correctamente
  const zIndices = {
    accesorio: 50,
    chaqueta: 40,
    torso: 30,
    piernas: 20,
    calzado: 10
  };

  const handlesStyle = {
    // Styling neutral para los Rnd handles
    className: "border border-gray-400 bg-white shadow-sm opacity-50 group-hover:opacity-100",
    style: { width: '8px', height: '8px' }
  };

  const getSilhouetteTitle = () => {
    return genero === 'femenino' ? 'Silueta Femenina' : 'Silueta Masculina';
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 border border-gray-200 font-sans-moda h-full w-full max-w-md mx-auto">
      
      {/* Título y Selector de Género Editorial */}
      <div className="w-full flex items-center justify-between mb-8 border-b border-gray-100 pb-5 gap-3">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest font-serif-moda italic">
          {getSilhouetteTitle()}
        </h2>
        
        <div className="flex bg-gray-100 p-1 rounded-none">
          <button
            type="button"
            onClick={() => setGenero('femenino')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-all ${
              genero === 'femenino' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            Femenino
          </button>
          <button
            type="button"
            onClick={() => setGenero('masculino')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-all ${
              genero === 'masculino' 
                ? 'bg-black text-white shadow-sm' 
                : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            Masculino
          </button>
        </div>
      </div>

      {/* ÁREA DEL MANIQUÍ (Dressing Room) */}
      <div 
        ref={dressingAreaRef}
        className="relative w-72 h-[500px] flex items-center justify-center bg-gray-50 border border-gray-200 overflow-hidden group shadow-inner"
      >
        <span className="absolute top-4 left-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest z-0 font-serif-moda italic">
          DRESSING ROOM
        </span>
        <span className="absolute bottom-4 right-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest z-0 font-serif-moda italic">
          MANNEQUIN VIEW
        </span>

        {/* SVG BASE - MANIQUÍ */}
        {genero === 'femenino' ? (
          <svg className="w-[180px] h-[450px] text-gray-200 opacity-80" viewBox="0 0 100 200" fill="currentColor">
            <circle cx="50" cy="18" r="11" />
            <path d="M 46 28 L 54 28 C 60 28 72 32 78 42 L 74 58 L 66 52 L 63 92 C 55 95 45 95 37 92 L 34 52 L 26 58 L 22 42 C 28 32 40 28 46 28 Z" />
            <path d="M 38 94 h 11 v 90 h -11 Z M 51 94 h 11 v 90 h -11 Z" />
          </svg>
        ) : (
          <svg className="w-[180px] h-[450px] text-gray-200 opacity-80" viewBox="0 0 100 200" fill="currentColor">
            <circle cx="50" cy="16" r="12" />
            <path d="M 44 27 L 56 27 C 65 27 78 30 84 42 L 78 60 L 70 54 L 68 94 L 32 94 L 30 54 L 22 60 L 16 42 C 22 30 35 27 44 27 Z" />
            <path d="M 34 96 h 14 v 88 h -14 Z M 52 96 h 14 v 88 h -14 Z" />
          </svg>
        )}

        {/* CAPAS DE PRENDAS ARRASTRABLES Y RESIZABLES */}
        {Object.entries(prendasSeleccionadas).map(([layerKey, prenda]) => {
          if (!prenda) return null;
          
          return (
            <Rnd
              key={layerKey}
              bounds="parent"
              enableResizing={{ bottomRight:true, bottomLeft:true, topRight:true, topLeft:true }}
              resizeHandleComponent={{
                topLeft: <div {...handlesStyle} />,
                topRight: <div {...handlesStyle} />,
                bottomLeft: <div {...handlesStyle} />,
                bottomRight: <div {...handlesStyle} />,
              }}
              className="group-hover:ring-1 group-hover:ring-gray-300 transition-all hover:z-[60]"
              dragHandleClassName={`drag-handle-${layerKey}`}
              style={{ zIndex: zIndices[layerKey] }}
              default={{ x: 50, y: 100, width: 150, height: 150 }}
            >
              <div className="w-full h-full relative group">
                {/* Drag Handle Overlay Minimalista */}
                <div className={`drag-handle-${layerKey} absolute inset-0 cursor-grab active:cursor-grabbing z-10`} />
                
                <img 
                  src={prenda.imagenUrl} 
                  alt={prenda.nombre}
                  className="w-full h-full object-contain drop-shadow-lg p-1"
                />
              </div>
            </Rnd>
          );
        })}
      </div>

      {/* Controles y Botones Inferiores Estilo Editorial */}
      <div className="w-full mt-8 border-t border-gray-100 pt-6 space-y-5 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest max-w-sm mx-auto">
          Arrastra y redimensiona cada pieza para ajustar el look en el maniquí.
        </p>
        
        {alGuardarOutfit && (
          <button
            onClick={alGuardarOutfit}
            disabled={Object.values(prendasSeleccionadas).filter(Boolean).length === 0}
            className="w-full bg-black hover:bg-gray-800 text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            ✓ Guardar Este Look
          </button>
        )}
      </div>

    </div>
  );
}