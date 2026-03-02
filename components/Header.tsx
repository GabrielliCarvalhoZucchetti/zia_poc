
import React from 'react';
import { User, UserRole, Resource, ResourceType } from '../types';
import { Icons } from '../constants';

interface HeaderProps {
  user: User;
  onRoleChange: (role: UserRole) => void;
  resources: Resource[];
  activeResource: Resource | null;
  setActiveResource: (resource: Resource) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onRoleChange, 
  resources, 
  activeResource, 
  setActiveResource 
}) => {
  const [showResourceMenu, setShowResourceMenu] = React.useState(false);
  const [showMarketMenu, setShowMarketMenu] = React.useState(false);

  const mainResources = resources.filter(r => r.type !== ResourceType.MARKET_MODEL);
  const marketModels = resources.filter(r => r.type === ResourceType.MARKET_MODEL);

  const roleLabels: Record<UserRole, string> = {
    [UserRole.BASIC]: 'Básico',
    [UserRole.INTERMEDIATE]: 'Intermediário',
    [UserRole.ADVANCED]: 'Avançado',
    [UserRole.ADMINISTRATOR]: 'Administrador'
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          {/* Seletor de Assistentes Principais */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowResourceMenu(!showResourceMenu);
                setShowMarketMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                activeResource && activeResource.type !== ResourceType.MARKET_MODEL
                ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {activeResource && activeResource.type !== ResourceType.MARKET_MODEL ? (
                <span>{activeResource.name}</span>
              ) : (
                <span>Selecionar Assistente</span>
              )}
              <svg className={`w-4 h-4 transition-transform ${showResourceMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {showResourceMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Pesquisar assistentes..." 
                      className="w-full pl-8 pr-4 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="absolute left-2 top-1.5 text-slate-400">
                      <Icons.Search />
                    </div>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agentes & Documentos</div>
                  {mainResources.map(res => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setActiveResource(res);
                        setShowResourceMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 text-left transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-700">{res.name}</div>
                          {res.environment === 'STAGING' && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100 uppercase">Homologação</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">{res.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botão "Outros" para Modelos de Mercado */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowMarketMenu(!showMarketMenu);
                setShowResourceMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                activeResource && activeResource.type === ResourceType.MARKET_MODEL
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Icons.Plus />
              <span>{activeResource && activeResource.type === ResourceType.MARKET_MODEL ? activeResource.name : 'Outros'}</span>
              <svg className={`w-4 h-4 transition-transform ${showMarketMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {showMarketMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 bg-indigo-50/50">
                  <div className="text-xs font-bold text-indigo-800">Modelos de Mercado</div>
                  <div className="text-[10px] text-indigo-600 font-medium">Integração com LLMs externas</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {marketModels.map(res => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setActiveResource(res);
                        setShowMarketMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-left transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-700">{res.name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{res.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          {Object.values(UserRole).map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                user.role === role 
                ? 'bg-white shadow-sm text-sky-600' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">{user.name}</div>
            <div className="text-[10px] font-bold text-sky-600 uppercase">{roleLabels[user.role]}</div>
          </div>
          <img src={user.avatar} alt="Usuário" className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200" />
        </div>
      </div>
    </header>
  );
};

export default Header;
