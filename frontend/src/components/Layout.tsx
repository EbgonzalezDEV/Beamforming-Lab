import { type PropsWithChildren, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Settings, 
  BarChart3, 
  BookOpen, 
  Menu, 
  X, 
  Radio, 
  Activity,
  Brain,
  Wifi
} from 'lucide-react';
import GlossaryModal from './GlossaryModal';

export default function Layout({ children }: PropsWithChildren) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: 'Configuración',
      href: '/',
      icon: Settings,
      description: 'Ajustar parámetros del sistema'
    },
    {
      name: 'Análisis de Señal',
      href: '/analysis',
      icon: BarChart3,
      description: 'Ver resultados y métricas'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="w-72 glass-card-strong border-r border-white/10 hidden lg:flex lg:flex-col">
          <div className="px-6 py-8 border-b border-white/10">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="icon-wrapper gradient-primary group-hover:scale-110 transition-transform duration-300">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Beamforming Lab</h1>
                <p className="text-white/60 text-sm">Laboratorio Virtual de Comunicaciones</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : 'text-white/70 hover:text-white'}`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-white/50">{item.description}</div>
                </div>
              </NavLink>
            ))}
          </nav>
          
          <div className="px-4 py-6 border-t border-white/10">
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Glosario Técnico</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden glass-card-strong border-b border-white/10">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="icon-wrapper gradient-primary">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">Beamforming Lab</span>
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsGlossaryOpen(true)}
                className="btn-primary p-2"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="btn-primary p-2"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="px-4 pb-4 space-y-2 border-t border-white/10">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'nav-item-active' : 'text-white/70 hover:text-white'}`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-white/50">{item.description}</div>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
            <div className="fade-in">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <footer className="px-4 lg:px-8 py-6 border-t border-white/10">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6 text-white/60 text-sm">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4" />
                  <span>5G/6G Systems</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Signal Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI-Powered Analysis</span>
                </div>
              </div>
              <div className="text-white/40 text-sm">
                © 2024 Beamforming Lab - Laboratorio Virtual
              </div>
            </div>
          </footer>
        </div>
      </div>

      <GlossaryModal open={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}


