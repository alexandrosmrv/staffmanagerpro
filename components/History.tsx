
import React, { useState } from 'react';
import { BreakRecord } from '../types';

interface HistoryProps {
  breaks: BreakRecord[];
}

const History: React.FC<HistoryProps> = ({ breaks }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBreaks = breaks.filter(b => 
    b.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.supervisorName && b.supervisorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.date.includes(searchTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (breaks.length === 0) return;

    const headers = [
      "Ημερομηνία",
      "Υπάλληλος",
      "Supervisor",
      "Βάρδια",
      "Ωράριο",
      "1st 30 Από", "1st 30 Έως",
      "2nd 30 Από", "2nd 30 Έως",
      "1st 10 Από", "1st 10 Έως",
      "2nd 10 Από", "2nd 10 Έως"
    ];

    const rows = breaks.map(record => [
      new Date(record.date).toLocaleDateString('el-GR'),
      record.staffName,
      record.supervisorName || '',
      record.shift,
      record.schedule,
      record.break30_1_From, record.break30_1_To,
      record.break30_2_From, record.break30_2_To,
      record.break10_1_From, record.break10_1_To,
      record.break10_2_From, record.break10_2_To
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `staff_breaks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TimeBadge = ({ from, to, label, color }: { from: string, to: string, label: string, color: string }) => {
    if (!from && !to) return null;
    return (
      <div className={`flex flex-col items-center px-2 py-1 rounded-lg border ${color} bg-white shadow-sm shrink-0 min-w-[60px]`}>
        <span className="text-[7px] font-black uppercase opacity-60 mb-0.5">{label}</span>
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
          <span>{from || '--:--'}</span>
          <span className="opacity-30">-</span>
          <span>{to || '--:--'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto print-container">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Ιστορικό Διαλειμμάτων</h2>
          <p className="text-slate-500">Πλήρες αρχείο καταχωρίσεων για όλες τις βάρδιες.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Αναζήτηση υπαλλήλου ή supervisor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 shadow-sm"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 shadow-lg shadow-slate-100 transition-all flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              Εκτύπωση
            </button>
            <button
              onClick={exportToCSV}
              disabled={breaks.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>📊</span>
              CSV
            </button>
          </div>
        </div>
      </header>

      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-slate-900 text-center uppercase tracking-widest border-b-2 border-slate-900 pb-2">
          Αρχείο Διαλειμμάτων Προσωπικού
        </h1>
        <p className="text-center text-slate-500 mt-2">Ημερομηνία Εκτύπωσης: {new Date().toLocaleDateString('el-GR')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px] print:min-w-full">
            <thead className="bg-slate-50 border-b border-slate-200 print:bg-white">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ημ/νία / Βάρδια</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Υπάλληλος</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supervisor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Διαστήματα</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBreaks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Δεν βρέθηκαν εγγραφές.
                  </td>
                </tr>
              ) : (
                filteredBreaks.map(record => (
                  <tr key={record.id} className="hover:bg-blue-50/30 transition-colors print:hover:bg-transparent">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{new Date(record.date).toLocaleDateString('el-GR')}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">{record.shift} • {record.schedule}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{record.staffName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm">{record.supervisorName || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 print:gap-1">
                        <TimeBadge from={record.break30_1_From} to={record.break30_1_To} label="1st 30'" color="border-blue-200 text-blue-700" />
                        <TimeBadge from={record.break30_2_From} to={record.break30_2_To} label="2nd 30'" color="border-blue-300 text-blue-800" />
                        <TimeBadge from={record.break10_1_From} to={record.break10_1_To} label="1st 10'" color="border-orange-200 text-orange-700" />
                        <TimeBadge from={record.break10_2_From} to={record.break10_2_To} label="2nd 10'" color="border-emerald-200 text-emerald-700" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
