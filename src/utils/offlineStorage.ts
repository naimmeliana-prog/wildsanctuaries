import { FieldIncident, VolunteerReview, VolunteerTask, GroupActivity, EnvironmentalStats, Sanctuary } from '../types';
import { mockIncidents, mockReviews, mockTasks, mockGroupActivities, mockEnvironmentalStats, mockSanctuaries } from '../data/mockData';

const INCIDENTS_KEY = 'ws_incidents_v2';
const REVIEWS_KEY = 'ws_reviews_v2';
const TASKS_KEY = 'ws_tasks_v2';
const ACTIVITIES_KEY = 'ws_activities_v2';
const STATS_KEY = 'ws_stats_v2';
const CURRENT_USER_KEY = 'ws_user_profile_v2';

export interface UserProfile {
  name: string;
  role: 'volunteer' | 'biologist' | 'ranger' | 'coordinator';
  email: string;
  fieldStation: string;
  volunteerBadgeId: string;
}

export const defaultUser: UserProfile = {
  name: 'Elena Garrido',
  role: 'volunteer',
  email: 'elena.garrido@wildconservation.org',
  fieldStation: 'Tsavo & Ostional Field Units',
  volunteerBadgeId: 'WS-VOL-2026-884'
};

export function getStoredUser(): UserProfile {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : defaultUser;
  } catch {
    return defaultUser;
  }
}

export function saveStoredUser(user: UserProfile): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function getStoredIncidents(): FieldIncident[] {
  try {
    const data = localStorage.getItem(INCIDENTS_KEY);
    return data ? JSON.parse(data) : mockIncidents;
  } catch {
    return mockIncidents;
  }
}

export function saveIncident(newIncident: FieldIncident): { incident: FieldIncident; wasOffline: boolean } {
  const current = getStoredIncidents();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  const incidentToSave: FieldIncident = {
    ...newIncident,
    status: isOnline ? 'synced' : 'pending_offline'
  };

  const updated = [incidentToSave, ...current];
  try {
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save incident locally', e);
  }

  return { incident: incidentToSave, wasOffline: !isOnline };
}

export function syncPendingIncidents(): number {
  const current = getStoredIncidents();
  let count = 0;
  const updated = current.map(inc => {
    if (inc.status === 'pending_offline') {
      count++;
      return { ...inc, status: 'synced' as const };
    }
    return inc;
  });

  if (count > 0) {
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(updated));
  }
  return count;
}

export function getStoredReviews(): VolunteerReview[] {
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? JSON.parse(data) : mockReviews;
  } catch {
    return mockReviews;
  }
}

export function saveReview(review: VolunteerReview): VolunteerReview[] {
  const current = getStoredReviews();
  const updated = [review, ...current];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  return updated;
}

export function getStoredTasks(): VolunteerTask[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : mockTasks;
  } catch {
    return mockTasks;
  }
}

export function updateTaskAssignment(taskId: string, volunteerName: string): VolunteerTask[] {
  const current = getStoredTasks();
  const updated = current.map(task => {
    if (task.id === taskId) {
      const alreadyAssigned = task.assignedVolunteers.includes(volunteerName);
      const newAssigned = alreadyAssigned 
        ? task.assignedVolunteers.filter(v => v !== volunteerName)
        : [...task.assignedVolunteers, volunteerName];
      
      const newStatus: 'open' | 'in_progress' | 'completed' = 
        newAssigned.length >= task.requiredVolunteers ? 'in_progress' : 'open';

      return {
        ...task,
        assignedVolunteers: newAssigned,
        status: newStatus
      };
    }
    return task;
  });
  localStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  return updated;
}

export function getStoredActivities(): GroupActivity[] {
  try {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : mockGroupActivities;
  } catch {
    return mockGroupActivities;
  }
}

export function toggleActivityEnrollment(activityId: string, volunteerName: string): GroupActivity[] {
  const current = getStoredActivities();
  const updated = current.map(act => {
    if (act.id === activityId) {
      const isEnrolled = act.enrolledVolunteers.includes(volunteerName);
      const newEnrolled = isEnrolled 
        ? act.enrolledVolunteers.filter(n => n !== volunteerName)
        : (act.enrolledVolunteers.length < act.capacity ? [...act.enrolledVolunteers, volunteerName] : act.enrolledVolunteers);
      return {
        ...act,
        enrolledVolunteers: newEnrolled
      };
    }
    return act;
  });
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  return updated;
}

export function getStoredStats(): EnvironmentalStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : mockEnvironmentalStats;
  } catch {
    return mockEnvironmentalStats;
  }
}

// Export data to CSV compatible with Microsoft Excel (with UTF-8 BOM)
export function exportDataToExcelCSV(incidents: FieldIncident[], sanctuaries: Sanctuary[]): void {
  const headers = [
    'ID Incidente',
    'Fecha / Hora',
    'Santuario',
    'Tipo Incidente',
    'Urgencia',
    'Coordenadas Latitud',
    'Coordenadas Longitud',
    'Estado Operativo',
    'Especie Involucrada',
    'Reportado Por',
    'Rol',
    'Descripción del Evento',
    'Acciones / Notas de Campo'
  ];

  const rows = incidents.map(inc => [
    `"${inc.id}"`,
    `"${inc.timestamp}"`,
    `"${inc.sanctuaryName}"`,
    `"${inc.type}"`,
    `"${inc.urgency.toUpperCase()}"`,
    `"${inc.lat}"`,
    `"${inc.lng}"`,
    `"${inc.status}"`,
    `"${inc.animalSpeciesInvolved || 'N/A'}"`,
    `"${inc.reportedBy}"`,
    `"${inc.reporterRole}"`,
    `"${inc.description.replace(/"/g, '""')}"`,
    `"${(inc.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Informe_Incidentes_FaunaSilvestre_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Print / PDF Report Generator
export function printOfficialConservationReport(
  sanctuaries: Sanctuary[],
  incidents: FieldIncident[],
  stats: EnvironmentalStats
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Informe Oficial de Conservación y Vida Silvestre</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { margin: 0; font-size: 22px; color: #0f766e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta { font-size: 12px; color: #475569; text-align: right; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
          .card { border: 1px solid #cbd5e1; padding: 14px; border-radius: 4px; background: #f8fafc; }
          .card-num { font-size: 20px; font-weight: 700; color: #0f172a; font-family: monospace; }
          .card-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; }
          h2 { font-size: 15px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
          th { text-align: left; background: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #334155; }
          td { padding: 8px 10px; border: 1px solid #e2e8f0; }
          .badge { font-size: 10px; font-weight: 600; text-transform: uppercase; padding: 2px 6px; border-radius: 2px; }
          .badge-critical { background: #fee2e2; color: #991b1b; }
          .badge-high { background: #ffedd5; color: #9a3412; }
          .badge-resolved { background: #dcfce7; color: #166534; }
          .badge-investigating { background: #e0f2fe; color: #075985; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Informe Oficial de Conservación de Fauna Silvestre</h1>
            <div class="subtitle">Red Global de Santuarios y Monitoreo de Campo en Áreas Protegidas</div>
          </div>
          <div class="meta">
            <div>Fecha de emisión: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}</div>
            <div>Ref: WS-BIO-REPORT-${Math.floor(Math.random() * 90000 + 10000)}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-num">${stats.totalProtectedHectares.toLocaleString()} ha</div>
            <div class="card-lbl">Área Protegida Activa</div>
          </div>
          <div class="card">
            <div class="card-num">${stats.totalWildAnimalsRehabilitated.toLocaleString()}</div>
            <div class="card-lbl">Fauna Silvestre Atendida</div>
          </div>
          <div class="card">
            <div class="card-num">${stats.totalReturnedToWild.toLocaleString()}</div>
            <div class="card-lbl">Reintroducciones Exitosas</div>
          </div>
          <div class="card">
            <div class="card-num">${stats.monthlyPatrolKilometers.toLocaleString()} km</div>
            <div class="card-lbl">Patrullas de Campo (Mes)</div>
          </div>
        </div>

        <h2>Registro Reciente de Incidentes y Amenazas en Terreno</h2>
        <table>
          <thead>
            <tr>
              <th>ID / Fecha</th>
              <th>Santuario</th>
              <th>Tipo de Incidente</th>
              <th>Urgencia</th>
              <th>Coordenadas GPS</th>
              <th>Especie</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${incidents.map(inc => `
              <tr>
                <td><strong>${inc.id}</strong><br><small>${inc.timestamp}</small></td>
                <td>${inc.sanctuaryName}</td>
                <td>${inc.type.replace('_', ' ')}</td>
                <td><span class="badge ${inc.urgency === 'critical' ? 'badge-critical' : 'badge-high'}">${inc.urgency}</span></td>
                <td>${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)}</td>
                <td>${inc.animalSpeciesInvolved || 'No especificada'}</td>
                <td><span class="badge ${inc.status === 'resolved' ? 'badge-resolved' : 'badge-investigating'}">${inc.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Santuarios y Bases de Intervención Activa</h2>
        <table>
          <thead>
            <tr>
              <th>Santuario</th>
              <th>País</th>
              <th>Especies Clave</th>
              <th>Área (ha)</th>
              <th>Biólogo/a Líder</th>
              <th>Éxito Rewilding</th>
            </tr>
          </thead>
          <tbody>
            ${sanctuaries.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.country}</td>
                <td>${s.rescuedAnimalTypes.join(', ')}</td>
                <td>${s.interventionAreaHectares.toLocaleString()}</td>
                <td>${s.leadBiologist.name}</td>
                <td>${s.rewildingSuccessRatePercent}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Documento expedido para autoridades ambientales y comités científicos de conservación.</div>
          <div>WildSanctuaries Global Research Network · Sin fines de lucro ni donaciones comerciales.</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
