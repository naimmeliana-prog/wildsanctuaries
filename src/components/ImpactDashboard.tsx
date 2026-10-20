import React from 'react';
import { EnvironmentalStats, Sanctuary, FieldIncident } from '../types';
import { 
  BarChart3, 
  FileDown, 
  Printer, 
  ShieldCheck, 
  Trees, 
  Activity, 
  HeartHandshake, 
  Footprints, 
  Camera, 
  CheckCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { exportDataToExcelCSV, printOfficialConservationReport } from '../utils/offlineStorage';

interface ImpactDashboardProps {
  stats: EnvironmentalStats;
  sanctuaries: Sanctuary[];
  incidents: FieldIncident[];
  language: 'es' | 'en';
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  stats,
  sanctuaries,
  incidents,
  language
}) => {
  const handleExportPDF = () => {
    printOfficialConservationReport(sanctuaries, incidents, stats);
  };

  const handleExportExcel = () => {
    exportDataToExcelCSV(incidents, sanctuaries);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Export Actions */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {language === 'es' ? 'Panel de Impacto Ambiental & Telemetría' : 'Environmental Impact & Field Telemetry'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'es' 
              ? 'Métricas consolidadas para comités científicos, ministerios de medio ambiente y autoridades competentes.'
              : 'Consolidated metrics for scientific committees, environmental ministries and competent authorities.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Exportar Informe PDF' : 'Export PDF Report'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Exportar Excel (CSV)' : 'Export Excel / CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip (Scientific & Precision design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            {language === 'es' ? 'Superficie Protegida' : 'Active Protected Area'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalProtectedHectares.toLocaleString()} <span className="text-xs font-normal text-slate-400">ha</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-1">
            +18.400 ha en corredores 2026
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            {language === 'es' ? 'Reintroducciones a la Vida Silvestre' : 'Successful Rewilding'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
            {stats.totalReturnedToWild.toLocaleString()} <span className="text-xs font-normal text-slate-400">ejemplares</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {((stats.totalReturnedToWild / stats.totalWildAnimalsRehabilitated) * 100).toFixed(1)}% tasa global de éxito
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            {language === 'es' ? 'Patrullaje Preventivo' : 'Monthly Patrol Coverage'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.monthlyPatrolKilometers.toLocaleString()} <span className="text-xs font-normal text-slate-400">km/mes</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            52 unidades caninas & guardaparques
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            {language === 'es' ? 'Horas de Voluntariado en Campo' : 'Volunteer Field Hours'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.volunteerHoursLoggedThisMonth.toLocaleString()} <span className="text-xs font-normal text-slate-400">horas</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-1">
            0 donaciones · 100% esfuerzo humano
          </div>
        </div>
      </div>

      {/* Breakdown by Sanctuary and Species Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table of Intervention Areas */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'es' ? 'Áreas de Intervención por Santuario' : 'Sanctuary Intervention Footprints'}
            </h4>
            <span className="text-xs font-mono text-slate-400">Hectáreas & Éxito</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sanctuaries.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{s.country} · {s.rescuedAnimalTypes.slice(0, 2).join(', ')}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {s.interventionAreaHectares.toLocaleString()} ha
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                    {s.rewildingSuccessRatePercent}% reintroducción
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Distribution & Camera Traps */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'es' ? 'Estado de Monitoreo & Detección Temprana' : 'Early Detection & Trap Network'}
            </h4>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>Cámaras Trampa de Visión Nocturna en Línea</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.activeCameraTraps} operativas</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                <div className="bg-emerald-700 h-2" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>Reproducción Confirmada en Libertad</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.speciesReproductionInWild} crías censadas</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                <div className="bg-sky-700 h-2" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>Neutralización de Trampas de Caza Furtiva</span>
                <span className="font-bold text-slate-900 dark:text-white">100% Retiro sin Bajas</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                <div className="bg-amber-600 h-2" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-900 dark:text-white block mb-1">
              {language === 'es' ? 'Nota Técnica para Auditorías de Biodiversidad:' : 'Technical Note for Biodiversity Audits:'}
            </strong>
            {language === 'es'
              ? 'Todos los datos de geoposicionamiento de especies bajo amenaza crítica están encriptados y se omiten los nidos y dormideros en las capas públicas para salvaguardar la integridad de los especímenes contra redes de tráfico.'
              : 'All geolocations of critically endangered wild fauna are encrypted; nesting sites and sleeping dens are redacted in public views to prevent poaching exploitation.'}
          </div>
        </div>
      </div>
    </div>
  );
};
