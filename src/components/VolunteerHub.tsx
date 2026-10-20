import React, { useState } from 'react';
import { Sanctuary, VolunteerTask, GroupActivity } from '../types';
import { UserProfile } from '../utils/offlineStorage';
import { 
  ClipboardList, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Plus, 
  MapPin, 
  Radio, 
  UserCheck
} from 'lucide-react';

interface VolunteerHubProps {
  tasks: VolunteerTask[];
  activities: GroupActivity[];
  sanctuaries: Sanctuary[];
  user: UserProfile;
  onUpdateTask: (taskId: string) => void;
  onToggleActivity: (actId: string) => void;
  language: 'es' | 'en';
}

export const VolunteerHub: React.FC<VolunteerHubProps> = ({
  tasks,
  activities,
  sanctuaries,
  user,
  onUpdateTask,
  onToggleActivity,
  language
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedSanctuaryId, setSelectedSanctuaryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tasks' | 'calendar'>('tasks');

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    if (selectedShift !== 'all' && task.shift !== selectedShift) return false;
    if (selectedSanctuaryId !== 'all' && task.sanctuaryId !== selectedSanctuaryId) return false;
    return true;
  });

  const getShiftLabel = (shift: VolunteerTask['shift']) => {
    switch (shift) {
      case 'morning': return language === 'es' ? 'Turno Mañana (05:45 - 11:30)' : 'Morning Shift (05:45 - 11:30)';
      case 'afternoon': return language === 'es' ? 'Turno Tarde (14:30 - 18:30)' : 'Afternoon Shift (14:30 - 18:30)';
      case 'full_day': return language === 'es' ? 'Jornada Completa' : 'Full Day';
      case 'night_watch': return language === 'es' ? 'Patrulla Nocturna (20:00 - 02:00)' : 'Night Watch (20:00 - 02:00)';
    }
  };

  const getCategoryLabel = (cat: VolunteerTask['category']) => {
    switch (cat) {
      case 'monitoring': return language === 'es' ? 'Telemetría & Monitoreo' : 'Telemetry & Monitoring';
      case 'habitat': return language === 'es' ? 'Restauración de Hábitat' : 'Habitat Restoration';
      case 'veterinary': return language === 'es' ? 'Apoyo Veterinario' : 'Veterinary Support';
      case 'patrol_support': return language === 'es' ? 'Patrulla Anti-Trampas' : 'Anti-Snare Patrol';
      case 'nutrition': return language === 'es' ? 'Alimentación Silvestre' : 'Wild Forage Prep';
    }
  };

  return (
    <div className="space-y-6">
      {/* Volunteer Badge Card */}
      <div className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-mono">
              {language === 'es' ? 'Perfil de Voluntario Activo' : 'Active Volunteer Profile'} · ID: {user.volunteerBadgeId}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {user.name} <span className="font-normal text-xs text-slate-500 font-mono">({user.role})</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {user.fieldStation}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs font-mono hidden sm:block">
            <span className="text-slate-400 block text-[10px] uppercase">Compromiso</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">100% Sin Donaciones</span>
          </div>
          <div className="p-1 bg-slate-100 dark:bg-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('tasks')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'tasks' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'es' ? 'Misiones de Campo' : 'Field Tasks'}
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {language === 'es' ? 'Calendario Grupal' : 'Group Calendar'}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'tasks' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  {language === 'es' ? 'Santuario' : 'Sanctuary'}
                </label>
                <select
                  value={selectedSanctuaryId}
                  onChange={(e) => setSelectedSanctuaryId(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">{language === 'es' ? 'Todos los santuarios' : 'All sanctuaries'}</option>
                  {sanctuaries.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  {language === 'es' ? 'Labor de Campo' : 'Field Task Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">{language === 'es' ? 'Todas las labores' : 'All categories'}</option>
                  <option value="monitoring">Telemetría & Monitoreo</option>
                  <option value="patrol_support">Patrulla Anti-Trampas</option>
                  <option value="habitat">Restauración de Hábitat</option>
                  <option value="nutrition">Alimentación Silvestre</option>
                  <option value="veterinary">Apoyo Veterinario</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  {language === 'es' ? 'Turno' : 'Shift'}
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">{language === 'es' ? 'Todos los turnos' : 'All shifts'}</option>
                  <option value="morning">Turno Mañana</option>
                  <option value="afternoon">Turno Tarde</option>
                  <option value="full_day">Jornada Completa</option>
                  <option value="night_watch">Patrulla Nocturna</option>
                </select>
              </div>
            </div>

            <div className="font-mono text-xs text-slate-500">
              {filteredTasks.length} {language === 'es' ? 'misiones asignables' : 'available missions'}
            </div>
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              return (
                <div 
                  key={task.id}
                  className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-xs font-mono text-slate-500">
                        {task.sanctuaryName}
                      </div>
                      <span className={`text-[10px] font-mono uppercase font-semibold ${task.urgency === 'urgent' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                        {task.urgency === 'urgent' ? 'Prioridad Alta' : 'Programada'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {task.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1 mb-2">
                      <span>{getCategoryLabel(task.category)}</span>
                      <span>·</span>
                      <span>{task.date}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">{getShiftLabel(task.shift)}</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {task.assignedVolunteers.length} / {task.requiredVolunteers} voluntarios
                      </span>
                    </div>

                    {task.assignedVolunteers.length > 0 && (
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        Equipo: {task.assignedVolunteers.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Group Activities Calendar */
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
              {language === 'es' ? 'Calendario Sincronizado de Actividades Grupales' : 'Synchronized Group Activities Calendar'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'es' 
                ? 'Jornadas comunitarias, censos estacionales y patrullas conjuntas dirigidas por los biólogos líderes.'
                : 'Community sessions, seasonal censuses and joint patrols led by lead conservationists.'}
            </p>
          </div>

          <div className="space-y-3">
            {activities.map((act) => {
              return (
                <div 
                  key={act.id}
                  className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <span>{act.sanctuaryName}</span>
                      <span>·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{act.date}</span>
                      <span>·</span>
                      <span>{act.time}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {act.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                      <span>Lugar: {act.locationDetails}</span>
                      <span>Líder científico: {act.leadScientist}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
                    <div className="text-xs font-mono text-slate-500">
                      <span className="font-bold text-slate-900 dark:text-white">{act.enrolledVolunteers.length}</span> / {act.capacity} plazas ocupadas
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
