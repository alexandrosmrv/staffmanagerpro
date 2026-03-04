
import React, { useState, useEffect, useCallback } from 'react';
import { Staff, BreakRecord, ViewType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StaffManager from './components/StaffManager';
import History from './components/History';
import Insights from './components/Insights';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [breaks, setBreaks] = useState<BreakRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRes, breaksRes] = await Promise.all([
        fetch(`${API_BASE}/staff`),
        fetch(`${API_BASE}/breaks`)
      ]);
      
      if (!staffRes.ok || !breaksRes.ok) throw new Error("Σφάλμα κατά τη σύνδεση με τον διακομιστή.");
      
      const staffData = await staffRes.json();
      const breaksData = await breaksRes.json();
      setStaff(staffData);
      setBreaks(breaksData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Αδυναμία σύνδεσης με τη βάση δεδομένων. Βεβαιωθείτε ότι ο server τρέχει.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addStaff = async (name: string, role: string) => {
    const newStaffMember: Staff = {
      id: crypto.randomUUID(),
      name,
      role,
      isActive: false
    };
    try {
      const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffMember)
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Failed to add staff:", err);
    }
  };

  const removeStaff = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Failed to remove staff:", err);
    }
  };

  const saveShiftEntry = async (entry: Omit<BreakRecord, 'id' | 'createdAt'>[]) => {
    const newRecords = entry.map(e => ({
      ...e,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }));
    
    try {
      const res = await fetch(`${API_BASE}/breaks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecords)
      });
      if (res.ok) {
        await fetchData();
        setCurrentView('history');
      }
    } catch (err) {
      console.error("Failed to save breaks:", err);
      alert("Σφάλμα αποθήκευσης. Δοκιμάστε ξανά.");
    }
  };

  const updateShiftEntry = async (updatedEntries: BreakRecord[]) => {
    try {
      const res = await fetch(`${API_BASE}/breaks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEntries)
      });
      if (res.ok) {
        await fetchData();
        setCurrentView('history');
      }
    } catch (err) {
      console.error("Failed to update breaks:", err);
      alert("Σφάλμα ενημέρωσης. Δοκιμάστε ξανά.");
    }
  };

  const renderContent = () => {
    if (error) return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-600 mb-2">Σφάλμα Σύνδεσης</h3>
        <p className="text-slate-500 max-w-md">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
        >
          Προσπάθεια Επανασύνδεσης
        </button>
      </div>
    );

    if (loading && staff.length === 0) return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSave={saveShiftEntry} onUpdate={updateShiftEntry} recentBreaks={breaks} staff={staff} />;
      case 'staff':
        return <StaffManager staff={staff} onAdd={addStaff} onRemove={removeStaff} />;
      case 'history':
        return <History breaks={breaks} />;
      case 'insights':
        return <Insights breaks={breaks} staff={staff} />;
      default:
        return <Dashboard onSave={saveShiftEntry} onUpdate={updateShiftEntry} recentBreaks={breaks} staff={staff} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
