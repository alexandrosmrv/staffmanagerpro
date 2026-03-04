
import React, { useState } from 'react';
import { Staff } from '../types';
import { ROLE_OPTIONS } from '../constants';

interface StaffManagerProps {
  staff: Staff[];
  onAdd: (name: string, role: string) => void;
  onRemove: (id: string) => void;
}

const StaffManager: React.FC<StaffManagerProps> = ({ staff, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), role);
      setName('');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Διαχείριση Προσωπικού</h2>
        <p className="text-slate-500">Προσθέστε ή αφαιρέστε μέλη της ομάδας σας.</p>
      </header>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Προσθήκη Νέου Μέλους</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Ονοματεπώνυμο</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="π.χ. Γιάννης Παπαδόπουλος"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Ρόλος / Θέση</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Προσθήκη
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ονοματεπώνυμο</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ρόλος</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Κατάσταση</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Δεν έχει προστεθεί προσωπικό ακόμα.
                  </td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-slate-600">{member.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.isActive ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {member.isActive ? 'Σε Διάλειμμα' : 'Ενεργός'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onRemove(member.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Διαγραφή
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StaffManager;
