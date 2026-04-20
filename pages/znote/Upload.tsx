
import React from 'react';
import { Icons } from '../../constants';

const ZnoteUpload: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-[32px] p-12 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20"/></svg>
            <h1 className="text-[32px] font-bold text-slate-800">Upload de Arquivos Transcritos</h1>
        </div>
        <p className="text-slate-500 text-lg mb-10">
          Converta arquivos .vtt em resumos executivos e prontos para o Bitrix.
        </p>

        <div className="h-[1px] w-full bg-slate-100 mb-10"></div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-base font-bold text-slate-700">
              <Icons.File className="w-4 h-4" />
              Título da Sessão*
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
              Bitrix Url
            </label>
            <input 
              type="text" 
              placeholder="https://sua-empresa.bitrix24.com.br/crm/deal/details/123/"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-base font-bold text-slate-700">
              <Icons.Link className="w-4 h-4" />
              Selecione seus arquivos
            </label>
            <div className="flex">
                <button className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2">
                    Selecionar Arquivos
                </button>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button className="px-8 py-3 bg-[#0070E0] opacity-80 text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-100 transition-all shadow-lg shadow-blue-50">
              <Icons.Sparkle className="w-5 h-5" />
              Processar Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZnoteUpload;
