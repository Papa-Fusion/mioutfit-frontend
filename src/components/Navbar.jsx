import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Props nuevas: abierto (boolean) y onCerrar (fn) para el drawer mobile
function Sidebar({ abierto, onCerrar }) {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavegar = (path) => {
    navigate(path);
    onCerrar?.(); // cierra el drawer en mobile al navegar
  };

  const links = [
    { path: '/home', label: 'Mi armario', icon: '✦' },
    { path: '/armar-outfit', label: 'Armar outfit', icon: '✦' },
    { path: '/outfits', label: 'Outfits guardados', icon: '✦' },
    { path: '/recomendaciones', label: 'Recomendaciones', icon: '✦' },
    { path: '/calendario', label: 'Calendario', icon: '✦' },
    { path: '/perfil', label: 'Mi perfil', icon: '✦' },
  ];

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-64 lg:w-56 bg-white border-r border-gray-200
        flex flex-col z-50 font-sans-moda
        transition-transform duration-300 ease-in-out
        ${abierto ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo + botón cerrar en mobile */}
      <div className="px-6 py-8 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-widest uppercase font-serif-moda italic">
            Closeout
          </h1>
          <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-[0.25em] font-semibold">
            Digital Experience
          </p>
        </div>
        {/* Botón X solo visible en mobile */}
        <button
          onClick={onCerrar}
          className="lg:hidden mt-1 text-gray-400 hover:text-black text-lg transition-colors"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => handleNavegar(link.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-none border transition-all text-left ${
                isActive
                  ? 'bg-black border-black text-white'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
              }`}
            >
              <span className={`text-[9px] ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Panel de Perfil de Usuario */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-2 bg-gray-50/50">
        <div
          onClick={() => handleNavegar('/perfil')}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer group transition-all"
        >
          {usuario?.fotoUrl ? (
            <img
              src={usuario.fotoUrl}
              alt={usuario.nombre}
              className="w-8 h-8 rounded-none border border-gray-300 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider flex-shrink-0">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide truncate group-hover:underline">
              {usuario?.nombre}
            </p>
            <p className="text-[10px] text-gray-400 truncate tracking-tight">
              {usuario?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 hover:text-black hover:border-black text-[10px] font-bold uppercase tracking-widest transition-colors bg-white"
        >
          ✕ Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;