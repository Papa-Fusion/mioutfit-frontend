import { useState } from 'react';
import Sidebar from './Navbar';

function Layout({ children }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] font-sans text-gray-900">
      {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      <Sidebar abierto={sidebarAbierto} onCerrar={() => setSidebarAbierto(false)} />

      <main className="flex-1 lg:ml-56 min-w-0">
        {/* Barra superior mobile con botón hamburguesa */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-widest uppercase font-serif-moda italic">
              Closeout
            </h1>
            <p className="text-[8px] text-gray-400 uppercase tracking-[0.2em] font-semibold">
              Digital Experience
            </p>
          </div>
          <button
            onClick={() => setSidebarAbierto(true)}
            className="flex flex-col gap-1.5 p-2 group"
            aria-label="Abrir menú"
          >
            <span className="block w-5 h-[1.5px] bg-gray-900 transition-all group-hover:w-6" />
            <span className="block w-4 h-[1.5px] bg-gray-900 transition-all group-hover:w-6" />
            <span className="block w-5 h-[1.5px] bg-gray-900 transition-all group-hover:w-6" />
          </button>
        </div>

        {/* Contenido de la página */}
        <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;