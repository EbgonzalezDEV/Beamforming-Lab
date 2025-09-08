import { PropsWithChildren, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import GlossaryModal from './GlossaryModal';

export default function Layout({ children }: PropsWithChildren) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex md:flex-col">
          <div className="px-6 py-5 border-b border-slate-700">
            <Link to="/" className="block text-xl font-bold text-white">Beamforming Lab</Link>
            <div className="text-slate-400 text-sm">Laboratorio virtual</div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'}`
              }
            >
              Configuración
            </NavLink>
            <NavLink
              to="/analysis"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'}`
              }
            >
              Análisis de Señal
            </NavLink>
          </nav>
          <div className="px-4 py-4 border-t border-slate-700">
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Glosario
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="bg-slate-800 border-b border-slate-700 md:hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <Link to="/" className="text-white font-semibold">Beamforming Lab</Link>
              <button
                onClick={() => setIsGlossaryOpen(true)}
                className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              >
                Glosario
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      <GlossaryModal open={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}


