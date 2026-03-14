import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/',          label: 'Dashboard',  icon: '📊' },
  { path: '/pipelines', label: 'Pipelines',  icon: '⚡' },
  { path: '/jobs',      label: 'Jobs',       icon: '📋' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">🔗 Webhook</h1>
          <p className="text-xs text-gray-400 mt-1">Pipeline Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">Webhook Pipeline v1.0</p>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-56 flex-1 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}