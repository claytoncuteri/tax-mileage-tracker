/**
 * OdometerLog tracks start/end of year odometer readings.
 * IRS requires annual odometer records to verify total miles.
 */

import { useState } from 'react';
import { Plus, Trash2, Gauge } from 'lucide-react';
import { useMileageStore, useAnnualStats } from '../../store';
import { formatTripDate } from '../../utils';

export function OdometerLog() {
  const readings = useMileageStore((s) => s.odometerReadings);
  const addReading = useMileageStore((s) => s.addOdometerReading);
  const deleteReading = useMileageStore((s) => s.deleteOdometerReading);
  const currentYear = useMileageStore((s) => s.currentYear);
  const annualStats = useAnnualStats();

  const [showForm, setShowForm] = useState(false);
  const [newReading, setNewReading] = useState('');
  const [newNote, setNewNote] = useState('');

  const handleAdd = async () => {
    const value = parseFloat(newReading);
    if (!value || value <= 0) return;
    await addReading(value, newNote || `Odometer reading — ${currentYear}`);
    setNewReading('');
    setNewNote('');
    setShowForm(false);
  };

  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const startReading = sortedReadings[0];
  const endReading = sortedReadings.length > 1 ? sortedReadings[sortedReadings.length - 1] : null;
  const odometerTotal =
    startReading && endReading ? endReading.reading - startReading.reading : null;

  return (
    <div>
      {/* Summary card */}
      <div
        style={{
          background: 'var(--mt-bg-card)',
          borderRadius: 'var(--mt-radius-lg)',
          padding: '16px 20px',
          border: '0.5px solid var(--mt-border)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Gauge size={18} style={{ color: 'var(--mt-text-muted)' }} />
          <span style={{ fontSize: 'var(--mt-font-size-base)', color: 'var(--mt-text-secondary)', fontWeight: 600 }}>
            Odometer — {currentYear}
          </span>
        </div>

        {odometerTotal !== null ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)' }}>Start</div>
                <div style={{ fontSize: 'var(--mt-font-size-base)', fontWeight: 700, color: 'var(--mt-text-primary)' }}>
                  {startReading.reading.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)' }}>End</div>
                <div style={{ fontSize: 'var(--mt-font-size-base)', fontWeight: 700, color: 'var(--mt-text-primary)' }}>
                  {endReading!.reading.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)' }}>Total</div>
                <div style={{ fontSize: 'var(--mt-font-size-base)', fontWeight: 700, color: 'var(--mt-text-primary)' }}>
                  {odometerTotal.toLocaleString()}
                </div>
              </div>
            </div>
            {Math.abs(annualStats.totalMiles - odometerTotal) > 100 && (
              <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-color-warning)', textAlign: 'center' }}>
                Logged miles ({Math.round(annualStats.totalMiles).toLocaleString()}) differ from odometer by{' '}
                {Math.abs(Math.round(annualStats.totalMiles - odometerTotal)).toLocaleString()} mi
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)', textAlign: 'center' }}>
            {readings.length === 0
              ? 'Add your start-of-year odometer reading'
              : 'Add your end-of-year reading to see totals'}
          </div>
        )}
      </div>

      {/* Reading list */}
      {sortedReadings.map((reading) => (
        <div
          key={reading.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '0.5px solid var(--mt-border)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--mt-font-size-base)', color: 'var(--mt-text-primary)', fontWeight: 600 }}>
              {reading.reading.toLocaleString()} mi
            </div>
            <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)' }}>
              {formatTripDate(reading.date)} — {reading.note}
            </div>
          </div>
          <button
            onClick={() => deleteReading(reading.id)}
            style={{ background: 'none', border: 'none', color: 'var(--mt-text-faint)', cursor: 'pointer', padding: 4, opacity: 0.5 }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {/* Add form */}
      {showForm ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="number"
            placeholder="Odometer reading"
            value={newReading}
            onChange={(e) => setNewReading(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 'var(--mt-radius-md)',
              border: '1px solid var(--mt-border)', background: 'var(--mt-bg-input)',
              color: 'var(--mt-text-primary)', fontSize: 'var(--mt-font-size-base)',
              fontFamily: 'var(--mt-font-family)', boxSizing: 'border-box', outline: 'none',
            }}
            autoFocus
          />
          <input
            type="text"
            placeholder='Note (e.g., "Start of year 2026")'
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 'var(--mt-radius-md)',
              border: '1px solid var(--mt-border)', background: 'var(--mt-bg-input)',
              color: 'var(--mt-text-primary)', fontSize: 'var(--mt-font-size-sm)',
              fontFamily: 'var(--mt-font-family)', boxSizing: 'border-box', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAdd} style={{
              flex: 1, padding: 10, borderRadius: 'var(--mt-radius-md)', border: 'none',
              background: 'var(--mt-color-success)', color: '#000', fontWeight: 700,
              fontSize: 'var(--mt-font-size-sm)', fontFamily: 'var(--mt-font-family)', cursor: 'pointer',
            }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{
              padding: '10px 14px', borderRadius: 'var(--mt-radius-md)',
              border: '0.5px solid var(--mt-border)', background: 'transparent',
              color: 'var(--mt-text-faint)', fontSize: 'var(--mt-font-size-sm)',
              fontFamily: 'var(--mt-font-family)', cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%', padding: 10, marginTop: 12, borderRadius: 'var(--mt-radius-md)',
            border: '1px dashed var(--mt-border)', background: 'transparent',
            color: 'var(--mt-color-success)', fontSize: 'var(--mt-font-size-sm)',
            fontWeight: 600, fontFamily: 'var(--mt-font-family)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Plus size={16} /> Add Reading
        </button>
      )}
    </div>
  );
}
