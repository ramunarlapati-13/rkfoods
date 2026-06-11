'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Location } from '@/lib/types';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SEED_LOCATIONS: Location[] = [
  { id: '1', city: 'Hyderabad', state: 'Telangana', pincode: '500001', active: true },
  { id: '2', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001', active: true },
  { id: '3', city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001', active: true },
  { id: '4', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', active: true },
  { id: '5', city: 'Bangalore', state: 'Karnataka', pincode: '560001', active: true },
  { id: '6', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', active: true },
  { id: '7', city: 'Delhi', state: 'Delhi', pincode: '110001', active: false },
];

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>(SEED_LOCATIONS);
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('locations').select('*').order('city', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setLocations(data.map((l: any) => ({
            id: l.id,
            city: l.city,
            state: l.state,
            pincode: l.pincode,
            active: Boolean(l.active)
          })));
        }
      } catch (err) {
        console.error('Error fetching locations from Supabase:', err);
      }
    })();
  }, []);

  const toggle = async (loc: Location) => {
    try {
      const { error } = await supabase.from('locations').update({ active: !loc.active }).eq('id', loc.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error toggling location in Supabase:', err);
    }
    setLocations((prev) => prev.map((l) => (l.id === loc.id ? { ...l, active: !l.active } : l)));
  };

  const addLocation = async () => {
    if (!newCity || !newState || !newPin) { toast.error('Fill all fields'); return; }
    const loc = { city: newCity, state: newState, pincode: newPin, active: true };
    let id = Date.now().toString();
    try {
      const { data, error } = await supabase.from('locations').insert(loc).select('id').single();
      if (error) throw error;
      if (data) id = data.id;
    } catch (err: any) {
      console.error('Error adding location to Supabase:', err);
      toast.error(err.message || 'Failed to add to database, using local fallback.');
    }
    setLocations((prev) => [...prev, { ...loc, id }]);
    setNewCity(''); setNewState(''); setNewPin('');
    toast.success('Location added!');
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error removing location in Supabase:', err);
    }
    setLocations((prev) => prev.filter((l) => l.id !== id));
    toast.success('Location removed.');
  };

  return (
    <div>
      <h2 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Delivery Locations</h2>

      {/* Add new */}
      <div className="card p-4 flex flex-wrap gap-3 mb-6 items-end">
        {[
          { label: 'City', value: newCity, set: setNewCity, id: 'admin-loc-city' },
          { label: 'State', value: newState, set: setNewState, id: 'admin-loc-state' },
          { label: 'Pincode', value: newPin, set: setNewPin, id: 'admin-loc-pin' },
        ].map(({ label, value, set, id }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
            <input
              id={id}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-ochre bg-transparent w-40"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        ))}
        <button id="admin-add-location-btn" onClick={addLocation} className="btn-primary flex items-center gap-2 text-sm py-2">
          <FiPlus size={14} /> Add
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['City', 'State', 'Pincode', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-b hover:bg-white/3 transition-colors" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{loc.city}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loc.state}</td>
                <td className="px-4 py-3 font-mono text-xs text-ochre">{loc.pincode}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${loc.active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {loc.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <button id={`admin-toggle-loc-${loc.id}`} onClick={() => toggle(loc)} className="hover:text-ochre transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {loc.active ? <FiToggleRight size={20} className="text-green-400" /> : <FiToggleLeft size={20} />}
                  </button>
                  <button id={`admin-delete-loc-${loc.id}`} onClick={() => remove(loc.id)} className="hover:text-clay transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <FiTrash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
