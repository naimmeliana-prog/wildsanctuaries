import React, { useState } from 'react';
import { FieldIncident, Sanctuary } from '../types';
import { UserProfile } from '../utils/offlineStorage';
import { 
  AlertTriangle, 
  MapPin, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldAlert,
  Flame,
  Crosshair,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface IncidentReporterProps {
  incidents: FieldIncident[];
  sanctuaries: Sanctuary[];
  user: UserProfile;
  isOnline: boolean;
  onAddIncident: (inc: FieldIncident) => void;
  onSyncPending: () => void;
  onExportCSV: () => void;
  language: 'es' | 'en';
}

export const IncidentReporter: React.FC<IncidentReporterProps> = ({
  incidents,
  sanctuaries,
  user,
  isOnline,
  onAddIncident,
  onSyncPending,
  onExportCSV,
  language
}) => {
  const [sanctuaryId, setSanctuaryId] = useState(sanctuaries[0]?.id || '');
  const [incidentType, setIncidentType] = useState<FieldIncident['type']>('poaching_threat');
  const [urgency, setUrgency] = useState<FieldIncident['urgency']>('critical');
  const [description, setDescription] = useState('');
  const [species, setSpecies] = useState('');
  const [lat, setLat] = useState<number>(-3.385);
  const [lng, setLng] = useState<number>(38.591);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [notes, setNotes] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  const pendingOfflineCount = incidents.filter(i => i.status === 'pending_offline').length;

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      alert(language === 'es' ? 'GPS no soportado' : 'GPS not supported');
      return;
    }
    setIsCapturingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(5)));
        setLng(Number(pos.coords.longitude.toFixed(5)));
        setIsCapturingGPS(false);
      },
      (err) => {
        setIsCapturingGPS(false);
        // Fallback to selected sanctuary's coordinates
        const s = sanctuaries.find(item => item.id === sanctuaryId);
        if (s) {
          setLat(s.lat);
          setLng(s.lng);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const selectedSanctuary = sanctuaries.find(s => s.id === sanctuaryId);

    const newIncident: FieldIncident = {
      id: `inc-${Date.now().toString().slice(-5)}`,
      sanctuaryId,
      sanctuaryName: selectedSanctuary ? selectedSanctuary.name : 'Sector de Reserva General',
      reportedBy: `${user.name} (${user.role})`,
      reporterRole: user.role,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: incidentType,
      urgency,
      lat,
      lng,
      description,
      status: isOnline ? 'synced' : 'pending_offline',
      animalSpeciesInvolved: species || undefined,
      notes: notes || undefined
    };

    onAddIncident(newIncident);
    setDescription('');
    setSpecies('');
    setNotes('');
  };

  const filteredIncidents = incidents.filter(i => {
    if (filterUrgency !== 'all' && i.urgency !== filterUrgency) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Network Status & Offline Telemetry Ribbon */}
      <div className={`p-4 border ${isOnline ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100' : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {isOnline 
                ? (language === 'es' ? 'Canal en Línea Activo' : 'Online Telemetry Active') 
                : (language === 'es' ? 'Modo Sin Cobertura (Zonas Remotas)' : 'Offline Mode (Remote Zones)')}
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-300 ml-2">
              · {pendingOfflineCount} {language === 'es' ? 'reportes en cola local' : 'reports in local queue'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingOfflineCount > 0 && isOnline && (
            <button
              onClick={onSyncPending}
              className="py-1 px-3 bg-emerald-800 text-white font-medium hover:bg-emerald-900 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Sincronizar Reportes Pendientes' : 'Sync Pending Reports'}</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="py-1 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Exportar CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Live Incident Feed & Status Tracker */}
        <div className="space-y-4">
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {language === 'es' ? 'Libro de Novedades de Campo' : 'Field Log & Incidents'}
              </span>
              <span className="text-slate-400 font-mono">({filteredIncidents.length})</span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400 text-[11px] uppercase">Urgencia:</span>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                aria-label="Filtrar por nivel de urgencia"
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Todas</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((inc) => (
              <div 
                key={inc.id}
                className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">{inc.sanctuaryName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{inc.timestamp}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400">ID: {inc.id}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Reportado por: {inc.reportedBy}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                      inc.urgency === 'critical' 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' 
                        : inc.urgency === 'high'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {inc.urgency}
                    </span>

                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${
                      inc.status === 'pending_offline' 
                        ? 'bg-amber-100 text-amber-900' 
                        : inc.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-sky-100 text-sky-900'
                    }`}>
                      {inc.status === 'pending_offline' ? 'Pendiente Offline' : inc.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {inc.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {inc.lat.toFixed(4)}, {inc.lng.toFixed(4)}
                    </span>
                    {inc.animalSpeciesInvolved && (
                      <span>Especie: <strong className="text-slate-700 dark:text-slate-300">{inc.animalSpeciesInvolved}</strong></span>
                    )}
                  </div>

                  {inc.notes && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Acción: {inc.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
