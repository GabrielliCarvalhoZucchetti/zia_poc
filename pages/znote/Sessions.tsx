
import React from 'react';
import { Icons } from '../../constants';

const ZnoteSessions: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-[32px] p-12 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-2">
          <Icons.Mic className="w-8 h-8 text-slate-800" />
          <h1 className="text-[32px] font-bold text-slate-800">Iniciar Sessão</h1>
        </div>
        <p className="text-slate-500 text-lg mb-10">
          Crie uma sessão antes de iniciar gravações. Durante a sessão você poderá editar os metadados, gravar e adicionar comentários.
        </p>

        <div className="h-[1px] w-full bg-slate-100 mb-10"></div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-base font-bold text-slate-700">
              <Icons.File className="w-4 h-4" />
              Título da Sessão
            </label>
            <input 
              type="text" 
              placeholder="Ex: Reunião de Alinhamento Q1"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-base font-bold text-slate-700">
              <Icons.Link className="w-4 h-4" />
              Bitrix Url (Opcional)
            </label>
            <input 
              type="text" 
              placeholder="https://sua-empresa.bitrix24.com.br/crm/deal/details/123/"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
            />
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <button className="px-8 py-3 border-2 border-[#0070E0] text-[#0070E0] font-bold rounded-xl hover:bg-sky-50 transition-all">
              Limpar Formulário
            </button>
            <button className="px-8 py-3 bg-[#0070E0] text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Abrir Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZnoteSessions;
