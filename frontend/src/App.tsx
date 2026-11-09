import { Link, Outlet, useLocation } from 'react-router-dom';

export default function App() {
  const { pathname } = useLocation();
  
  const navLinkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      pathname === path
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Prompt Evaluator
            </h1>
          </div>
          <nav className="flex space-x-2">
            <Link to="/builder" className={navLinkClass('/builder')}>
              Constructor Guiado
            </Link>
            <Link to="/validator" className={navLinkClass('/validator')}>
              Validador Libre
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}