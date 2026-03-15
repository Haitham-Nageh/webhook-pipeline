import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/pipelines", label: "Pipelines" },
  { path: "/jobs", label: "Jobs" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
        <div className="px-6 py-5 border-b border-gray-800">
          <p className="text-sm font-semibold text-white tracking-wide">
            Webhook Pipeline
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-gray-800 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">v1.0.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8 min-h-screen">{children}</main>
    </div>
  );
}
