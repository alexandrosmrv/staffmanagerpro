
import React, { useState, useEffect } from 'react';
import { BreakRecord, Staff } from '../types';
import { getBreakInsights } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface InsightsProps {
  breaks: BreakRecord[];
  staff: Staff[];
}

const Insights: React.FC<InsightsProps> = ({ breaks, staff }) => {
  const [aiReport, setAiReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const report = await getBreakInsights(breaks, staff);
    setAiReport(report);
    setLoading(false);
  };

  useEffect(() => {
    if (breaks.length > 0) {
      fetchInsights();
    }
  }, []);

  // Fix: Prepare data for the chart by counting breaks per employee instead of summing non-existent duration/staffId
  const chartData = staff.map(s => {
    const breakCount = breaks
      .filter(b => b.staffName === s.name)
      .length;
    return {
      name: s.name.split(' ')[0], // First name only for display
      count: breakCount
    };
  }).filter(d => d.count > 0);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Ανάλυση AI & Στατιστικά</h2>
          <p className="text-slate-500">Ευφυείς παρατηρήσεις για τη βελτίωση της παραγωγικότητας.</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading || breaks.length === 0}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 shadow-md'
          }`}
        >
          {loading ? '⌛ Αναλύεται...' : '🔄 Ανανέωση Ανάλυσης'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Statistics Chart */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-700">Αριθμός Διαλειμμάτων ανά Υπάλληλο</h3>
          <div className="h-[300px] w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                Δεν υπάρχουν αρκετά δεδομένα για γράφημα.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 1 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* AI Report Card */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
            <span>✨</span> Gemini AI Insights
          </h3>
          <div className="flex-1 text-slate-600 leading-relaxed overflow-y-auto prose prose-slate">
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse"></div>
              </div>
            ) : aiReport ? (
              <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>') }} />
            ) : (
              <p className="italic text-slate-400">Πατήστε "Ανανέωση" για να δημιουργηθεί η αναφορά από την AI.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Powered by Gemini 3 Flash
          </div>
        </section>
      </div>
    </div>
  );
};

export default Insights;
