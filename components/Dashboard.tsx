
import React, { useState, useMemo } from 'react';
import { SHIFT_OPTIONS, SCHEDULE_OPTIONS } from '../constants';
import { BreakRecord, Staff } from '../types';

interface DashboardProps {
  onSave: (entries: Omit<BreakRecord, 'id' | 'createdAt'>[]) => void;
  onUpdate: (entries: BreakRecord[]) => void;
  recentBreaks: BreakRecord[];
  staff: Staff[];
}

const Dashboard: React.FC<DashboardProps> = ({ onSave, onUpdate, recentBreaks, staff }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState(SHIFT_OPTIONS[0]);
  const [schedule, setSchedule] = useState(SCHEDULE_OPTIONS[0]);
  const [supervisorName, setSupervisorName] = useState('');
  const [showExtraBreaks, setShowExtraBreaks] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const initialEntry = { 
    id: '',
    name: '', 
    b30_1_f: '', b30_1_t: '',
    b30_2_f: '', b30_2_t: '',
    b10_1_f: '', b10_1_t: '',
    b10_2_f: '', b10_2_t: ''
  };

  const [staffEntries, setStaffEntries] = useState(Array(4).fill(null).map(() => ({ ...initialEntry })));

  const groupedBreaks = useMemo(() => {
    const groups: Record<string, BreakRecord[]> = {};
    const limit = Date.now() - (48 * 60 * 60 * 1000);
    
    recentBreaks
      .filter(b => b.createdAt > limit)
      .forEach(b => {
        const timeKey = Math.floor(b.createdAt / 60000);
        const key = `${b.date}-${b.shift}-${b.schedule}-${timeKey}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(b);
      });
    return Object.values(groups).sort((a, b) => b[0].createdAt - a[0].createdAt);
  }, [recentBreaks]);

  const handleStaffChange = (index: number, field: string, value: string) => {
    const newEntries = [...staffEntries];
    (newEntries[index] as any)[field] = value;
    setStaffEntries(newEntries);
  };

  const selectGroupToEdit = (group: BreakRecord[]) => {
    const first = group[0];
    setDate(first.date);
    setShift(first.shift);
    setSchedule(first.schedule);
    setSupervisorName(first.supervisorName || '');
    
    const ids: string[] = [];
    const newEntries = Array(4).fill(null).map((_, i) => {
      const record = group[i];
      if (record) {
        ids.push(record.id);
        return {
          id: record.id,
          name: record.staffName,
          b30_1_f: record.break30_1_From, b30_1_t: record.break30_1_To,
          b30_2_f: record.break30_2_From, b30_2_t: record.break30_2_To,
          b10_1_f: record.break10_1_From, b10_1_t: record.break10_1_To,
          b10_2_f: record.break10_2_From, b10_2_t: record.break10_2_To
        };
      }
      return { ...initialEntry };
    });

    setStaffEntries(newEntries);
    setEditingIds(ids);
    setIsSelectionMode(false);
  };

  const cancelEdit = () => {
    setEditingIds([]);
    setSupervisorName('');
    setStaffEntries(Array(4).fill(null).map(() => ({ ...initialEntry })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filledEntries = staffEntries.filter(entry => entry.name.trim() !== '');
    if (filledEntries.length === 0) {
      alert("Παρακαλώ εισάγετε τουλάχιστον ένα όνομα υπαλλήλου.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingIds.length > 0) {
        const updatedRecords: BreakRecord[] = filledEntries.map(entry => ({
          id: entry.id || crypto.randomUUID(),
          staffName: entry.name,
          supervisorName,
          date,
          shift,
          schedule,
          break30_1_From: entry.b30_1_f,
          break30_1_To: entry.b30_1_t,
          break30_2_From: entry.b30_2_f,
          break30_2_To: entry.b30_2_t,
          break10_1_From: entry.b10_1_f,
          break10_1_To: entry.b10_1_t,
          break10_2_From: entry.b10_2_f,
          break10_2_To: entry.b10_2_t,
          createdAt: Date.now()
        }));
        await onUpdate(updatedRecords);
      } else {
        const records = filledEntries.map(entry => ({
          staffName: entry.name,
          supervisorName,
          date,
          shift,
          schedule,
          break30_1_From: entry.b30_1_f,
          break30_1_To: entry.b30_1_t,
          break30_2_From: entry.b30_2_f,
          break30_2_To: entry.b30_2_t,
          break10_1_From: entry.b10_1_f,
          break10_1_To: entry.b10_1_t,
          break10_2_From: entry.b10_2_f,
          break10_2_To: entry.b10_2_t,
        }));
        await onSave(records);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const timeInputClass = "w-full bg-white px-2 py-2 rounded-lg border border-slate-300 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-center text-slate-800 appearance-none disabled:opacity-50";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20">
      <datalist id="staff-names">
        {staff.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <span>{editingIds.length > 0 ? '📝' : '🕒'}</span>
            {editingIds.length > 0 ? 'Διόρθωση Εγγραφής' : 'Νέα Καταχώριση Βάρδιας'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {editingIds.length > 0 ? 'Τροποποιήστε τα στοιχεία της επιλεγμένης βάρδιας.' : 'Καταχωρίστε τα διαλείμματα του προσωπικού για σήμερα.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowExtraBreaks(!showExtraBreaks)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border shadow-sm ${
              showExtraBreaks 
              ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700' 
              : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
            }`}
          >
            <span>{showExtraBreaks ? '🏠' : '➕'}</span>
            {showExtraBreaks ? 'Κύρια Διαλείμματα' : 'Επιπλέον Διαλείμματα'}
          </button>
        </div>
      </header>

      {editingIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-800 font-bold text-sm uppercase tracking-wider">Λειτουργία Επεξεργασίας</p>
              <p className="text-amber-600 text-xs font-medium">Ενημερώνετε μια υπάρχουσα καταχώριση.</p>
            </div>
          </div>
          <button 
            onClick={cancelEdit}
            className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm"
          >
            Ακύρωση & Νέο
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
        {isSelectionMode && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">Επιλογή για Διόρθωση</h4>
                <button onClick={() => setIsSelectionMode(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                {groupedBreaks.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-2">🔎</span>
                    <p className="text-slate-400 italic font-medium">Δεν βρέθηκαν πρόσφατες εγγραφές.</p>
                  </div>
                ) : (
                  groupedBreaks.map((group, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectGroupToEdit(group)}
                      className="w-full text-left p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black bg-slate-200 px-2 py-0.5 rounded-lg uppercase">{group[0].shift}</span>
                          <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg uppercase">{group[0].schedule}</span>
                          <span className="text-xs font-bold text-slate-500">{new Date(group[0].date).toLocaleDateString('el-GR')}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          {group.map(b => b.staffName).join(', ')}
                        </p>
                      </div>
                      <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 md:p-10 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ημερομηνία</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Βάρδια</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                {SHIFT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ωράριο</label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                {SCHEDULE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Supervisor</label>
              <input
                type="text"
                placeholder="Ονοματεπώνυμο..."
                value={supervisorName}
                list="staff-names"
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 pb-4 border-b border-slate-100">
              <span className="p-2 bg-blue-50 rounded-lg">📋</span> 
              Πρόγραμμα Διαλειμμάτων
            </h3>

            {/* Desktop Header Row */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-3 mb-2">
              <div className={`${showExtraBreaks ? 'col-span-3' : 'col-span-6'} text-[10px] font-black text-slate-400 uppercase tracking-widest ml-12`}>
                Ονοματεπώνυμο
              </div>
              {!showExtraBreaks ? (
                <>
                  <div className="col-span-4 text-center text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/50 py-1 rounded-t-lg">
                    1st 30' (Από - Έως)
                  </div>
                  <div className="col-span-2"></div>
                </>
              ) : (
                <>
                  <div className="col-span-3 text-center text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-100/30 py-1 rounded-t-lg">
                    2nd 30'
                  </div>
                  <div className="col-span-3 text-center text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50/50 py-1 rounded-t-lg">
                    1st 10'
                  </div>
                  <div className="col-span-3 text-center text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/50 py-1 rounded-t-lg">
                    2nd 10'
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-4 lg:space-y-3">
              {staffEntries.map((entry, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-3 items-center p-5 lg:p-3 bg-white lg:bg-slate-50/50 rounded-3xl lg:rounded-2xl border border-slate-200 lg:border-transparent transition-all hover:bg-white hover:shadow-xl hover:border-slate-200 group"
                >
                  <div className={`flex items-center gap-4 col-span-1 ${showExtraBreaks ? 'lg:col-span-3' : 'lg:col-span-6'}`}>
                    <span className="w-8 h-8 shrink-0 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <label className="lg:hidden text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Ονοματεπώνυμο</label>
                      <input
                        type="text"
                        placeholder="Όνομα υπαλλήλου..."
                        value={entry.name}
                        list="staff-names"
                        onChange={(e) => handleStaffChange(index, 'name', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none py-1.5 text-slate-800 font-bold text-base transition-colors placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  {!showExtraBreaks ? (
                    <>
                      <div className="col-span-1 lg:col-span-4 bg-blue-50/50 p-3 lg:p-1.5 rounded-2xl border border-blue-100/50 animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1.5 text-center">
                            <label className="lg:hidden text-[9px] font-black text-blue-600 uppercase tracking-widest">1st 30' Από</label>
                            <input type="time" value={entry.b30_1_f} onChange={(e) => handleStaffChange(index, 'b30_1_f', e.target.value)} className={timeInputClass} />
                          </div>
                          <div className="flex flex-col gap-1.5 text-center">
                            <label className="lg:hidden text-[9px] font-black text-blue-600 uppercase tracking-widest">1st 30' Έως</label>
                            <input type="time" value={entry.b30_1_t} onChange={(e) => handleStaffChange(index, 'b30_1_t', e.target.value)} className={timeInputClass} />
                          </div>
                        </div>
                      </div>
                      <div className="hidden lg:block lg:col-span-2"></div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 col-span-1 lg:col-span-3 bg-blue-100/30 p-3 lg:p-1.5 rounded-2xl border border-blue-200/20">
                        <div className="flex flex-col gap-1.5 text-center">
                          <label className="lg:hidden text-[9px] font-black text-blue-700 uppercase tracking-widest">2nd 30' Από</label>
                          <input type="time" value={entry.b30_2_f} onChange={(e) => handleStaffChange(index, 'b30_2_f', e.target.value)} className={timeInputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5 text-center">
                          <label className="lg:hidden text-[9px] font-black text-blue-700 uppercase tracking-widest">2nd 30' Έως</label>
                          <input type="time" value={entry.b30_2_t} onChange={(e) => handleStaffChange(index, 'b30_2_t', e.target.value)} className={timeInputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 col-span-1 lg:col-span-3 bg-orange-50/50 p-3 lg:p-1.5 rounded-2xl border border-orange-100/50">
                        <div className="flex flex-col gap-1.5 text-center">
                          <label className="lg:hidden text-[9px] font-black text-orange-600 uppercase tracking-widest">1st 10' Από</label>
                          <input type="time" value={entry.b10_1_f} onChange={(e) => handleStaffChange(index, 'b10_1_f', e.target.value)} className={timeInputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5 text-center">
                          <label className="lg:hidden text-[9px] font-black text-orange-600 uppercase tracking-widest">1st 10' Έως</label>
                          <input type="time" value={entry.b10_1_t} onChange={(e) => handleStaffChange(index, 'b10_1_t', e.target.value)} className={timeInputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 col-span-1 lg:col-span-3 bg-emerald-50/50 p-3 lg:p-1.5 rounded-2xl border border-emerald-100/50">
                        <div className="flex flex-col gap-1.5 text-center">
                          <label className="lg:hidden text-[9px] font-black text-emerald-600 uppercase tracking-widest">2nd 10' Από</label>
                          <input type="time" value={entry.b10_2_f} onChange={(e) => handleStaffChange(index, 'b10_2_f', e.target.value)} className={timeInputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5 text-center">
                          <label className="lg:hidden text-[9px] font-black text-emerald-600 uppercase tracking-widest">2nd 10' Έως</label>
                          <input type="time" value={entry.b10_2_t} onChange={(e) => handleStaffChange(index, 'b10_2_t', e.target.value)} className={timeInputClass} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={() => setIsSelectionMode(true)}
            className="w-full md:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-300 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group shadow-sm active:scale-95"
          >
            <span className="text-lg">📂</span>
            Επιλογή από Πρόσφατα
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full md:w-auto px-12 py-4 text-white rounded-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50 ${
              editingIds.length > 0 
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200/50' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200/50'
            }`}
          >
            <span className={`text-2xl transition-transform ${isSaving ? 'animate-spin' : 'group-hover:rotate-12'}`}>
              {isSaving ? '⌛' : (editingIds.length > 0 ? '🔄' : '✅')}
            </span>
            {isSaving ? 'ΑΠΟΘΗΚΕΥΣΗ...' : (editingIds.length > 0 ? 'ΕΝΗΜΕΡΩΣΗ ΕΓΓΡΑΦΗΣ' : 'ΟΡΙΣΤΙΚΗ ΑΠΟΘΗΚΕΥΣΗ')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Dashboard;
