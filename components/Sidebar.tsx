
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
    { path: '/chat', label: 'Playground', icon: <Icons.Chat /> },
    { path: '/apps', label: 'Aplicações', icon: <Icons.Apps /> },
    { path: '/resources', label: 'Gestão de Recursos', icon: <Icons.AgentBuilder /> },
    { path: '/lab', label: 'Laboratório', icon: <Icons.Lab /> },
    { path: '/zia-monitoring', label: 'Monitoramento', icon: <Icons.Users /> },
    { path: '/audit', label: 'Auditoria', icon: <Icons.Search /> },
    { path: '/docs', label: 'Documentação', icon: <Icons.Documentation /> },
  ];

  if (userRole === UserRole.ADMINISTRATOR) {
    menuItems.push({ path: '/access-requests', label: 'Solicitações', icon: <Icons.Check /> });
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          Z
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">ZIA</span>
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
