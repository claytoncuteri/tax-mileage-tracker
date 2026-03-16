/**
 * Settings component for configuring the mileage tracker.
 * Sections: Account, Vehicle, Tax, Destinations, Display, Data.
 */

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMileageStore } from '../../store';
import type { Destination, VehicleInfo, TaxSettings, ThemeMode } from '../../types';

type SettingsSection = 'account' | 'vehicle' | 'tax' | 'destinations' | 'display' | 'data';

export function Settings() {
  const [openSection, setOpenSection] = useState<SettingsSection | null>('account');
  const vehicle = useMileageStore((s) => s.vehicle);
  const tax = useMileageStore((s) => s.tax);
  const theme = useMileageStore((s) => s.theme);
  const destinations = useMileageStore((s) => s.destinations);
  const setVehicle = useMileageStore((s) => s.setVehicle);
  const setTax = useMileageStore((s) => s.setTax);
  const setTheme = useMileageStore((s) => s.setTheme);
  const addDestination = useMileageStore((s) => s.addDestination);
  const updateDestination = useMileageStore((s) => s.updateDestination);
  const removeDestination = useMileageStore((s) => s.removeDestination);

  const toggleSection = (section: SettingsSection) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Account */}
      <SettingsGroup title="Account" section="account" openSection={openSection} onToggle={toggleSection}>
        <FieldInput label="Name" value={tax.userName} onChange={(v) => setTax({ ...tax, userName: v })} />
        <FieldInput
          label="Businesses"
          value={tax.businessNames.join(', ')}
          onChange={(v) => setTax({ ...tax, businessNames: v.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="Comma-separated business names"
        />
      </SettingsGroup>

      {/* Vehicle */}
      <SettingsGroup title="Vehicle" section="vehicle" openSection={openSection} onToggle={toggleSection}>
        <FieldInput label="Vehicle Name" value={vehicle.name} onChange={(v) => setVehicle({ ...vehicle, name: v })} />
        <FieldNumber label="Vehicle Cost ($)" value={vehicle.cost} onChange={(v) => setVehicle({ ...vehicle, cost: v })} />
        <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', margin: '8px 0 4px', fontWeight: 600 }}>
          EV Settings (leave blank for gas)
        </div>
        <FieldNumber label="kWh per Mile" value={vehicle.kwhPerMile ?? 0} onChange={(v) => setVehicle({ ...vehicle, kwhPerMile: v || undefined })} step={0.01} />
        <FieldNumber label="Cost per kWh ($)" value={vehicle.costPerKwh ?? 0} onChange={(v) => setVehicle({ ...vehicle, costPerKwh: v || undefined })} step={0.01} />
        <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', margin: '8px 0 4px', fontWeight: 600 }}>
          Gas Settings (leave blank for EV)
        </div>
        <FieldNumber label="MPG" value={vehicle.mpg ?? 0} onChange={(v) => setVehicle({ ...vehicle, mpg: v || undefined })} step={0.1} />
        <FieldNumber label="Gas Price ($/gal)" value={vehicle.gasPricePerGallon ?? 0} onChange={(v) => setVehicle({ ...vehicle, gasPricePerGallon: v || undefined })} step={0.01} />
      </SettingsGroup>

      {/* Tax */}
      <SettingsGroup title="Tax" section="tax" openSection={openSection} onToggle={toggleSection}>
        <FieldNumber label="Tax Rate (%)" value={tax.taxRate * 100} onChange={(v) => setTax({ ...tax, taxRate: v / 100 })} step={1} />
        <FieldNumber label="Target Business Use (%)" value={tax.targetBusinessPercent * 100} onChange={(v) => setTax({ ...tax, targetBusinessPercent: v / 100 })} step={1} />
        <FieldNumber label="Tax Year" value={tax.taxYear} onChange={(v) => setTax({ ...tax, taxYear: v })} step={1} />
      </SettingsGroup>

      {/* Destinations */}
      <SettingsGroup title="Destinations" section="destinations" openSection={openSection} onToggle={toggleSection}>
        {destinations.map((dest) => (
          <DestinationEditor key={dest.id} destination={dest} onUpdate={updateDestination} onDelete={removeDestination} />
        ))}
        <button
          onClick={() =>
            addDestination({
              name: 'New Destination',
              subtitle: '',
              defaultMiles: 0,
              type: 'Business',
              icon: 'pin',
              color: '#5DCAA5',
              defaultNote: '',
              category: 'Other',
            })
          }
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 'var(--mt-radius-md)',
            border: '1px dashed var(--mt-border)',
            background: 'transparent',
            color: 'var(--mt-color-success)',
            fontSize: 'var(--mt-font-size-sm)',
            fontWeight: 600,
            fontFamily: 'var(--mt-font-family)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          <Plus size={16} /> Add Destination
        </button>
      </SettingsGroup>

      {/* Display */}
      <SettingsGroup title="Display" section="display" openSection={openSection} onToggle={toggleSection}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['dark', 'light', 'auto'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--mt-radius-md)',
                border: theme === mode ? '1.5px solid var(--mt-color-info)' : '0.5px solid var(--mt-border)',
                background: theme === mode ? 'var(--mt-bg-active)' : 'var(--mt-bg-card)',
                color: theme === mode ? 'var(--mt-text-primary)' : 'var(--mt-text-muted)',
                fontSize: 'var(--mt-font-size-sm)',
                fontWeight: 600,
                fontFamily: 'var(--mt-font-family)',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </SettingsGroup>
    </div>
  );
}

/** Collapsible settings section */
function SettingsGroup({
  title,
  section,
  openSection,
  onToggle,
  children,
}: {
  title: string;
  section: SettingsSection;
  openSection: SettingsSection | null;
  onToggle: (s: SettingsSection) => void;
  children: React.ReactNode;
}) {
  const isOpen = openSection === section;
  return (
    <div
      style={{
        background: 'var(--mt-bg-card)',
        borderRadius: 'var(--mt-radius-lg)',
        border: '0.5px solid var(--mt-border)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => onToggle(section)}
        style={{
          width: '100%',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          color: 'var(--mt-text-secondary)',
          fontSize: 'var(--mt-font-size-base)',
          fontWeight: 600,
          fontFamily: 'var(--mt-font-family)',
          cursor: 'pointer',
        }}
      >
        {title}
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/** Text input field */
function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 'var(--mt-radius-md)',
          border: '1px solid var(--mt-border)',
          background: 'var(--mt-bg-input)',
          color: 'var(--mt-text-primary)',
          fontSize: 'var(--mt-font-size-sm)',
          fontFamily: 'var(--mt-font-family)',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </div>
  );
}

/** Number input field */
function FieldNumber({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 'var(--mt-radius-md)',
          border: '1px solid var(--mt-border)',
          background: 'var(--mt-bg-input)',
          color: 'var(--mt-text-primary)',
          fontSize: 'var(--mt-font-size-sm)',
          fontFamily: 'var(--mt-font-family)',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </div>
  );
}

/** Inline destination editor */
function DestinationEditor({
  destination,
  onUpdate,
  onDelete,
}: {
  destination: Destination;
  onUpdate: (id: string, updates: Partial<Destination>) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 'var(--mt-radius-md)',
        padding: '10px 12px',
        border: '0.5px solid var(--mt-border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mt-text-secondary)',
            fontSize: 'var(--mt-font-size-sm)',
            fontWeight: 600,
            fontFamily: 'var(--mt-font-family)',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
          }}
        >
          {destination.name}
          <span style={{ color: 'var(--mt-text-faint)', fontWeight: 400, marginLeft: 8 }}>
            {destination.defaultMiles > 0 ? `${destination.defaultMiles} mi` : 'custom mi'}
          </span>
        </button>
        <button
          onClick={() => onDelete(destination.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mt-color-danger)',
            cursor: 'pointer',
            padding: 4,
            opacity: 0.6,
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      {isExpanded && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <FieldInput label="Name" value={destination.name} onChange={(v) => onUpdate(destination.id, { name: v })} />
          <FieldNumber label="Default Miles (RT)" value={destination.defaultMiles} onChange={(v) => onUpdate(destination.id, { defaultMiles: v })} step={0.1} />
          <FieldInput label="Default Note" value={destination.defaultNote} onChange={(v) => onUpdate(destination.id, { defaultNote: v })} />
          <FieldInput label="Address" value={destination.address ?? ''} onChange={(v) => onUpdate(destination.id, { address: v })} placeholder="Street address for distance lookup" />
          <FieldInput label="Category" value={destination.category ?? ''} onChange={(v) => onUpdate(destination.id, { category: v })} />
          <div>
            <label style={{ display: 'block', fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', fontWeight: 600, marginBottom: 4 }}>Type</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['Business', 'Personal'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdate(destination.id, { type: t })}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 'var(--mt-radius-sm)',
                    border: destination.type === t ? '1.5px solid var(--mt-color-info)' : '0.5px solid var(--mt-border)',
                    background: destination.type === t ? 'var(--mt-bg-active)' : 'transparent',
                    color: destination.type === t ? 'var(--mt-text-primary)' : 'var(--mt-text-muted)',
                    fontSize: 'var(--mt-font-size-xs)',
                    fontWeight: 600,
                    fontFamily: 'var(--mt-font-family)',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
