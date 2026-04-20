
import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Icons } from '../../constants';
import ZnoteSessions from './Sessions';
import ZnoteUpload from './Upload';
import ZnoteHistory from './History';

const ZnoteLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/znote/sessions', label: 'Sessões', icon: <Icons.Mic /> },
    { path: '/znote/upload', label: 'Upload', icon: <Icons.Upload /> },
    { path: '/znote/history', label: 'Histórico', icon: <Icons.ClipboardList /> },
  ];

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Sidebar Znote */}
      <aside className="w-[300px] bg-slate-50/50 border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 relative">
            <div className="w-10 h-10 bg-[#0070E0] rounded-xl flex items-center justify-center text-white font-bold text-lg">
              Zn
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Znote</h2>
              <p className="text-[9px] text-slate-400 font-medium leading-tight">Transcrições<br/>inteligentes</p>
            </div>
            <button 
              onClick={() => navigate('/apps')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-[#0070E0] shadow-sm transition-all"
            >
              <Icons.ChevronLeftDouble className="w-3 h-3" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                  ? 'bg-sky-50 text-[#0070E0] font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110 text-[#0070E0]' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#f8f9fa]">
        <Routes>
          <Route index element={<Navigate to="sessions" replace />} />
          <Route path="sessions" element={<ZnoteSessions />} />
          <Route path="upload" element={<ZnoteUpload />} />
          <Route path="history" element={<ZnoteHistory />} />
        </Routes>
      </main>
    </div>
  );
};

export default ZnoteLayout;
