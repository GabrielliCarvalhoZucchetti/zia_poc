
import React, { useState, useRef } from 'react';
import { Icons } from '../constants';

const ItauLeadUploadPage: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const historyData = [
    { file: 'Leads conquista e pa 14-04-2026.xlsx', date: '14/04, 20:49', leads: 3, bitrix: 3, wa: 3, failures: 0, responded: 3 },
    { file: 'Leads conquista e pa 13-04-2026.xlsx', date: '14/04, 13:05', leads: 3, bitrix: 3, wa: 3, failures: 0, responded: 3 },
    { file: 'Leads conquista e pa 10-04-2026.xlsx', date: '13/04, 13:28', leads: 5, bitrix: 5, wa: 5, failures: 0, responded: 5 },
    { file: 'Leads conquista e pa 16-04-2026.xlsx', date: '09/04, 18:11', leads: 2, bitrix: 2, wa: 2, failures: 0, responded: 2 },
    { file: '09.04 ZIA PORTAL.xlsx', date: '09/04, 18:11', leads: 24, bitrix: 24, wa: 24, failures: 0, responded: 24 },
    { file: 'HUB 07.04 AGENTE IA.xlsx', date: '07/04, 19:39', leads: 24, bitrix: 24, wa: 24, failures: 0, responded: 24 },
    { file: 'TESTE.xlsx', date: '02/04, 12:07', leads: 1, bitrix: 1, wa: 1, failures: 0, responded: 1 },
    { file: 'upload.xlsx', date: '01/04, 14:56', leads: 1, bitrix: 1, wa: 1, failures: 0, responded: 0 },
    { file: 'Teste Tiago-Gabi.xlsx', date: '01/04, 14:56', leads: 2, bitrix: 2, wa: 2, failures: 0, responded: 2 },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Importação de Leads Itaú</h1>
          <p className="text-lg text-slate-500">
            Envie a planilha "Base Zucchetti" (.xlsx) — o sistema cadastra no Bitrix e envia WhatsApp automaticamente.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">Upload de Arquivo</h2>
            <p className="text-slate-500 text-sm">Selecione o arquivo Excel (.xlsx) contendo a base de leads.</p>
          </div>

          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-3xl p-16 text-center transition-all flex flex-col items-center justify-center gap-4 ${
              isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-400 hover:bg-slate-50'
            }`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx" />
            <div className="w-12 h-12 flex items-center justify-center text-slate-300">
              <Icons.Upload className="w-12 h-12" strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-slate-700">Clique para selecionar</p>
              <p className="text-sm text-slate-400 font-medium">Suporta arquivos .XLSX até 10MB</p>
            </div>
          </div>

          <button className="w-full py-4 bg-[#B9E6FF] text-sky-900 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#a5d8f5] transition-all shadow-sm">
            <Icons.Upload className="w-6 h-6" />
            Enviar Planilha
          </button>
        </div>

        {/* History Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50">
            <h2 className="text-2xl font-bold text-slate-800">Histórico de Lotes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fcfdff]">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Arquivo</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Data</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Leads</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Bitrix</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">WA</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Falhas</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Responderam</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-medium text-slate-700 whitespace-nowrap">{row.file}</td>
                    <td className="px-6 py-5 text-sm text-slate-400 whitespace-nowrap font-medium">{row.date}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-700 text-center">{row.leads}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-[#E6F4EA] text-[#0D652D] px-2 py-0.5 rounded-md text-xs font-bold">{row.bitrix}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-[#E1F1FF] text-[#0070E0] px-2 py-0.5 rounded-md text-xs font-bold">{row.wa}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-300 text-center font-medium">{row.failures > 0 ? row.failures : '—'}</td>
                    <td className="px-6 py-5 text-center">
                      {row.responded > 0 ? (
                        <span className="bg-[#E6F4EA] text-[#0D652D] px-2 py-0.5 rounded-md text-xs font-bold">{row.responded}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Icons.ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItauLeadUploadPage;
