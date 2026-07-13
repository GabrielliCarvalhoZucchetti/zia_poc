
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface SidebarProps {
  userRole?: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/home', label: 'Início', icon: <Icons.Home /> },
    { path: '/chat', label: 'Playground', icon: <Icons.Chat /> },
    { path: '/apps', label: 'Aplicações', icon: <Icons.Apps /> },
    { path: '/resources', label: 'Gestão de Recursos', icon: <Icons.AgentBuilder /> },
    { path: '/models', label: 'Lista de Modelos', icon: <Icons.Cpu /> },
    { path: '/lab', label: 'Laboratório', icon: <Icons.Lab /> },
    { path: '/luna-monitoring', label: 'Monitoramento', icon: <Icons.Users /> },
    {
      path: '/luna-xp',
      label: 'Luna XP',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6" />
          <circle cx="18" cy="18" r="4" />
          <path d="M12 18a6 6 0 0 0-6-6" />
        </svg>
      )
    },
    { path: '/audit', label: 'Auditoria', icon: <Icons.Search /> },
    { path: '/docs', label: 'Documentação', icon: <Icons.Documentation /> },
  ];

  if (userRole === UserRole.ADMINISTRATOR) {
    menuItems.push({ path: '/access-requests', label: 'Solicitações', icon: <Icons.Check /> });
    menuItems.push({
      path: '/gestor-vinculos',
      label: 'Vínculos de Gestores',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    });
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          L
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">Luna</span>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/chat');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                ? 'bg-sky-50 text-sky-600 font-medium' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer">
          <Icons.Settings />
          <span>Configurações</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
