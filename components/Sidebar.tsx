
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Ταμπλό', icon: '🏠' },
    { id: 'staff', label: 'Προσωπικό', icon: '👥' },
    { id: 'history', label: 'Ιστορικό', icon: '📜' },
    { id: 'insights', label: 'Ανάλυση AI', icon: '🧠' },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">StaffBreak Pro</h1>
        <p className="text-xs text-slate-400 mt-1">Σύστημα Διαχείρισης</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; 2024 StaffBreak Manager
      </div>
    </aside>
  );
};

export default Sidebar;
