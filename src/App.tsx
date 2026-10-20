import React, { useState, useEffect } from 'react';
import { 
  Sanctuary, 
  VolunteerReview, 
  VolunteerTask, 
  GroupActivity, 
  FieldIncident, 
  FieldNotification,
  AppTab 
} from './types';
import { 
  mockSanctuaries, 
  mockReviews, 
  mockTasks, 
  mockGroupActivities, 
  mockIncidents, 
  mockEnvironmentalStats, 
  mockBiologists, 
  mockSuccessStories 
} from './data/mockData';
import { 
  getStoredUser, 
  saveStoredUser, 
  UserProfile, 
  getStoredIncidents, 
  saveIncident, 
  syncPendingIncidents, 
  getStoredReviews, 
  saveReview, 
  getStoredTasks, 
  updateTaskAssignment, 
  getStoredActivities, 
  toggleActivityEnrollment, 
  getStoredStats, 
  exportDataToExcelCSV, 
  printOfficialConservationReport 
} from './utils/offlineStorage';
import { translations, Language } from './utils/translations';
import { InteractiveMap } from './components/InteractiveMap';
import { SanctuariesGrid } from './components/SanctuariesGrid';
import { SanctuaryDetail } from './components/SanctuaryDetail';
import { VolunteerHub } from './components/VolunteerHub';
import { IncidentReporter } from './components/IncidentReporter';
import { ImpactDashboard } from './components/ImpactDashboard';
import { BiologistProfiles } from './components/BiologistProfiles';
import { SuccessStories } from './components/SuccessStories';
import { NotificationCenter } from './components/NotificationCenter';
import { VolunteerSignupModal } from './components/VolunteerSignupModal';
import { 
  MapPin, 
  ShieldAlert, 
  Moon, 
  Sun, 
  Globe, 
  Wifi, 
  WifiOff, 
  Calendar, 
  Users, 
  FileText, 
  Award, 
  Compass, 
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  Layers,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('es');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ws_dark_mode');
      if (saved !== null) return saved === 'true';
      return true; // Default dark
    } catch {
      return true;
    }
  });
  const [activeTab, setActiveTab] = useState<AppTab>('explore_map');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Data States with offline persistence
  const [user, setUser] = useState<UserProfile>(getStoredUser());
  const [sanctuaries] = useState<Sanctuary[]>(mockSanctuaries);
  const [selectedSanctuary, setSelectedSanctuary] = useState<Sanctuary | null>(null);
  const [signupSanctuary, setSignupSanctuary] = useState<Sanctuary | null>(null);
  
  const [incidents, setIncidents] = useState<FieldIncident[]>([]);
  const [reviews, setReviews] = useState<VolunteerReview[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [environmentalStats] = useState(getStoredStats());

  // Notifications State
  const [notifications, setNotifications] = useState<FieldNotification[]>([
    {
      id: 'notif-1',
      title: 'Alerta de Caza Furtiva en Tsavo',
      body: 'Detectadas trampas de alambre en Sector K-4. Unidad canina en camino.',
      timestamp: '11:25',
      urgency: 'critical',
      type: 'incident',
      read: false,
      linkTab: 'incident_reports'
    },
    {
      id: 'notif-2',
      title: 'Próxima Arribada en Ostional',
      body: 'Inicio de patrulla nocturna comunitaria de tortugas lora programada para las 20:00.',
      timestamp: '10:00',
      urgency: 'info',
      type: 'activity',
      read: false,
      linkTab: 'group_calendar'
    }
  ]);

  const t = translations[language];

  // Initialize and synchronize Dark Mode class on html and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      try {
        localStorage.setItem('ws_dark_mode', 'true');
      } catch {}
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      try {
        localStorage.setItem('ws_dark_mode', 'false');
      } catch {}
    }
  }, [darkMode]);

  // Network Online/Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const syncedCount = syncPendingIncidents();
      if (syncedCount > 0) {
        setIncidents(getStoredIncidents());
        // Notify user of auto-sync
        const syncNotif: FieldNotification = {
          id: `sync-${Date.now()}`,
          title: 'Sincronización Automática Exitosa',
          body: `Se han transmitido ${syncedCount} reporte(s) acumulados en modo offline a la central.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          urgency: 'info',
          type: 'incident',
          read: false
        };
        setNotifications(prev => [syncNotif, ...prev]);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleStorageChange = () => {
      setIncidents(getStoredIncidents());
      setReviews(getStoredReviews());
      setTasks(getStoredTasks());
      setActivities(getStoredActivities());
      setUser(getStoredUser());
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);

    // Initial load from storage
    handleStorageChange();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handlers
  const handleAddIncident = (newIncident: FieldIncident) => {
    const { incident, wasOffline } = saveIncident(newIncident);
    setIncidents(getStoredIncidents());

    // Add push alert
    const notif: FieldNotification = {
      id: `inc-notif-${Date.now()}`,
      title: `Incidente: ${incident.type.replace('_', ' ').toUpperCase()}`,
      body: `${incident.sanctuaryName} · ${incident.urgency.toUpperCase()} · ${wasOffline ? 'Guardado en cola offline' : 'Transmitido en línea'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgency: incident.urgency === 'critical' ? 'critical' : 'alert',
      type: 'incident',
      read: false,
      linkTab: 'incident_reports'
    };

    setNotifications(prev => [notif, ...prev]);

    // Native browser notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`[ALERTA CAMPO] ${incident.type.replace('_', ' ')}`, {
          body: `${incident.sanctuaryName}: ${incident.description}`,
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
  };

  const handleForceSync = () => {
    const count = syncPendingIncidents();
    setIncidents(getStoredIncidents());
    alert(language === 'es' ? `${count} reportes sincronizados correctamente con la nube.` : `${count} reports synced with cloud successfully.`);
  };

  const handleAddReview = (newReview: VolunteerReview) => {
    const updated = saveReview(newReview);
    setReviews(updated);
  };

  const handleUpdateTask = (taskId: string) => {
    const updated = updateTaskAssignment(taskId, user.name);
    setTasks(updated);
  };

  const handleToggleActivity = (actId: string) => {
    const updated = toggleActivityEnrollment(actId, user.name);
    setActivities(updated);
  };

  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifs = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const pendingIncidentsCount = incidents.filter(i => i.status === 'pending_offline').length;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      
      {/* Offline Status Warning Banner (shown when offline) */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {language === 'es' 
                ? 'TRABAJO OFFLINE EN ZONA REMOTA: Las incidencias y tareas se almacenan localmente y se sincronizarán al recuperar la cobertura.' 
                : 'OFFLINE REMOTE FIELD MODE: Incidents and tasks are saved locally and will auto-sync once connection is restored.'}
            </span>
          </div>
          <span className="font-bold">{pendingIncidentsCount} {language === 'es' ? 'en cola' : 'queued'}</span>
        </div>
      )}

      {/* HEADER: Two-tier architecture - Tier 1: Brand & Top Utilities | Tier 2: Dedicated Navigation Bar */}
      <header className="sticky top-0 z-[1100] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Tier 1: Brand & Utilities */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60">
          
          {/* Brand Wordmark & Conservation Tagline */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setActiveTab('explore_map');
                setSelectedSanctuary(null);
              }} 
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <img src="/favicon.svg" alt="" className="w-6 h-6 shrink-0" />
              <span className="font-extrabold tracking-tight">WildSanctuaries</span>
            </button>
            <span className="hidden md:inline-block text-[11px] font-mono text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-800 pl-3">
              {language === 'es' ? 'Red Global de Santuarios de Fauna Silvestre' : 'Global Wildlife Conservation Network'}
            </span>
            <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
              {sanctuaries.length} {language === 'es' ? 'Santuarios Registrados' : 'Registered Sanctuaries'}
            </span>
          </div>

          {/* Right Utilities: Status, Language, Dark Mode, Notifications, Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Online / Offline interactive toggle button */}
            <button
              type="button"
              onClick={() => {
                setIsOnline(prev => {
                  const next = !prev;
                  if (next) {
                    const syncedCount = syncPendingIncidents();
                    if (syncedCount > 0) {
                      setIncidents(getStoredIncidents());
                    }
                  }
                  return next;
                });
              }}
              title={isOnline ? (language === 'es' ? 'Haz clic para cambiar a Modo Offline (Sin Cobertura)' : 'Click to switch to Offline Mode') : (language === 'es' ? 'Haz clic para volver al Modo Online y sincronizar' : 'Click to switch to Online Mode and sync')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono border transition-colors cursor-pointer ${isOnline ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'border-amber-400 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300'}`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">{language === 'es' ? 'Online' : 'Online'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span className="font-semibold">{language === 'es' ? 'Offline' : 'Offline'}</span>
                  {pendingIncidentsCount > 0 && (
                    <span className="ml-1 px-1 bg-amber-500 text-slate-950 font-bold rounded-xs text-[10px]">
                      {pendingIncidentsCount}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="px-2 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              title="Cambiar idioma / Switch language"
            >
              {language.toUpperCase()}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="px-2.5 py-1 text-xs font-mono font-medium flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              title={darkMode ? (language === 'es' ? 'Cambiar a Modo Claro' : 'Switch to Light Mode') : (language === 'es' ? 'Cambiar a Modo Oscuro' : 'Switch to Dark Mode')}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold">{language === 'es' ? 'Modo Claro' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-semibold">{language === 'es' ? 'Modo Oscuro' : 'Dark'}</span>
                </>
              )}
            </button>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Navigation Bar Underneath with clean buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 text-xs scrollbar-none">
            <button
              onClick={() => { setActiveTab('explore_map'); setSelectedSanctuary(null); }}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'explore_map' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.navMap}</span>
            </button>
            <button
              onClick={() => { setActiveTab('sanctuaries_list'); setSelectedSanctuary(null); }}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'sanctuaries_list' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.navSanctuaries}</span>
              <span className="text-[10px] font-mono opacity-80">({sanctuaries.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('volunteer_hub'); setSelectedSanctuary(null); }}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'volunteer_hub' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{t.navVolunteering}</span>
            </button>
            <button
              onClick={() => { setActiveTab('incident_reports'); setSelectedSanctuary(null); }}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'incident_reports' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.navIncidents}</span>
              {pendingIncidentsCount > 0 && (
                <span className="ml-1 px-1 bg-amber-400 text-slate-950 font-mono text-[10px] font-bold">
                  {pendingIncidentsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('impact_analytics'); setSelectedSanctuary(null); }}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'impact_analytics' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t.navImpact}</span>
            </button>
            <button
              onClick={() => { setActiveTab('biologists'); setSelectedSanctuary(null); }}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'biologists' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t.navBiologists}</span>
            </button>
            <button
              onClick={() => { setActiveTab('rewilding_stories'); setSelectedSanctuary(null); }}
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'rewilding_stories' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.navRewilding}</span>
            </button>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/90">
            <button
              onClick={() => { setActiveTab('explore_map'); setMobileMenuOpen(false); }}
              className={`p-2 text-left font-medium flex items-center gap-2 ${activeTab === 'explore_map' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}
            >
              <Compass className="w-4 h-4" />
              <span>{t.navMap}</span>
            </button>
            <button
              onClick={() => { setActiveTab('sanctuaries_list'); setMobileMenuOpen(false); }}
              className={`p-2 text-left font-medium flex items-center gap-2 ${activeTab === 'sanctuaries_list' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.navSanctuaries} ({sanctuaries.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('volunteer_hub'); setMobileMenuOpen(false); }}
              className={`p-2 text-left font-medium flex items-center gap-2 ${activeTab === 'volunteer_hub' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{t.navVolunteering}</span>
            </button>
            <button
              onClick={() => { setActiveTab('incident_reports'); setMobileMenuOpen(false); }}
              className={`p-2 text-left font-medium flex items-center gap-2 ${activeTab === 'incident_reports' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{t.navIncidents}</span>
            </button>
            <button
              onClick={() => { setActiveTab('impact_analytics'); setMobileMenuOpen(false); }}
              className={`p-2 text-left font-medium flex items-center gap-2 ${activeTab === 'impact_analytics' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.navImpact}</span>
            </button>
            <button
              onClick={() => { setActiveTab('biologists'); setMobileMenuOpen(false); }}
              className={`p-2 text-left font-medium flex items-center gap-2 ${activeTab === 'biologists' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}
            >
              <Award className="w-4 h-4" />
              <span>{t.navBiologists}</span>
            </button>
            <button
              onClick={() => { setActiveTab('rewilding_stories'); setMobileMenuOpen(false); }}
              className={`p-2 text-left font-medium flex items-center gap-2 col-span-2 ${activeTab === 'rewilding_stories' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.navRewilding}</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* Informative Disclaimer Banner (Zero Donations / Strictly Wildlife) */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {language === 'es' ? 'POLÍTICA DE CONSERVACIÓN CIENTÍFICA:' : 'SCIENTIFIC POLICY:'}
            </span>
            <span>{t.noDonationsNotice}</span>
          </div>
          <span className="font-mono text-emerald-700 dark:text-emerald-400 shrink-0 font-semibold">
            {t.wildlifeOnlyDisclaimer}
          </span>
        </div>

        {/* Selected Sanctuary Full Profile Modal / View */}
        {selectedSanctuary ? (
          <SanctuaryDetail
            sanctuary={selectedSanctuary}
            reviews={reviews}
            onAddReview={handleAddReview}
            onOpenVolunteerSignup={(s) => setSignupSanctuary(s)}
            onClose={() => setSelectedSanctuary(null)}
            language={language}
          />
        ) : (
          <>
            {/* View Switching */}
            {activeTab === 'explore_map' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {language === 'es' ? 'Cartografía Global de Santuarios & Zonas de Intervención' : 'Global Sanctuaries Cartography & Active Zones'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {language === 'es' 
                        ? 'Explora las coordenadas geográficas, radio de búsqueda cercana y polígonos de reserva activa.' 
                        : 'Explore GPS coordinates, nearby search radius, and active reserve buffer zones.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{sanctuaries.length} santuarios activos</span>
                    <span>·</span>
                    <span>5 continentes</span>
                  </div>
                </div>

                <InteractiveMap
                  sanctuaries={sanctuaries}
                  selectedSanctuary={selectedSanctuary}
                  onSelectSanctuary={(s) => setSelectedSanctuary(s)}
                  onApplyVolunteer={(s) => setSignupSanctuary(s)}
                  language={language}
                />

                {/* Quick Directory strip below map */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      {language === 'es' ? 'Santuarios Destacados en Protección de Especies Amenazadas' : 'Featured Sanctuaries for Endangered Species'}
                    </h3>
                    <button
                      onClick={() => setActiveTab('sanctuaries_list')}
                      className="text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>{language === 'es' ? 'Ver catálogo completo' : 'View full catalog'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sanctuaries.slice(0, 4).map(s => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSanctuary(s)}
                        className="cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-2"
                      >
                        <div className="h-28 w-full bg-slate-950 overflow-hidden">
                          <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-xs font-mono text-slate-400">{s.country}</div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{s.name}</h4>
                        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                          {s.rewildingSuccessRatePercent}% rewilding · {s.volunteerProgram.minDays}d mín.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sanctuaries_list' && (
              <SanctuariesGrid
                sanctuaries={sanctuaries}
                onSelectSanctuary={(s) => setSelectedSanctuary(s)}
                onApplyVolunteer={(s) => setSignupSanctuary(s)}
                language={language}
              />
            )}

            {activeTab === 'volunteer_hub' && (
              <VolunteerHub
                tasks={tasks}
                activities={activities}
                sanctuaries={sanctuaries}
                user={user}
                onUpdateTask={handleUpdateTask}
                onToggleActivity={handleToggleActivity}
                language={language}
              />
            )}

            {activeTab === 'group_calendar' && (
              <VolunteerHub
                tasks={tasks}
                activities={activities}
                sanctuaries={sanctuaries}
                user={user}
                onUpdateTask={handleUpdateTask}
                onToggleActivity={handleToggleActivity}
                language={language}
              />
            )}

            {activeTab === 'incident_reports' && (
              <IncidentReporter
                incidents={incidents}
                sanctuaries={sanctuaries}
                user={user}
                isOnline={isOnline}
                onAddIncident={handleAddIncident}
                onSyncPending={handleForceSync}
                onExportCSV={() => exportDataToExcelCSV(incidents, sanctuaries)}
                language={language}
              />
            )}

            {activeTab === 'impact_analytics' && (
              <ImpactDashboard
                stats={environmentalStats}
                sanctuaries={sanctuaries}
                incidents={incidents}
                language={language}
              />
            )}

            {activeTab === 'biologists' && (
              <BiologistProfiles
                biologists={mockBiologists}
                sanctuaries={sanctuaries}
                language={language}
              />
            )}

            {activeTab === 'rewilding_stories' && (
              <SuccessStories
                stories={mockSuccessStories}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* Volunteer Signup Modal */}
      {signupSanctuary && (
        <VolunteerSignupModal
          sanctuary={signupSanctuary}
          user={user}
          onClose={() => setSignupSanctuary(null)}
          onSuccess={(upd) => setUser(upd)}
          language={language}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div>
            WildSanctuaries Global Network · Monitoreo y Conservación de Fauna Silvestre
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Trabajo de Campo</span>
            <span>·</span>
            <span>Cero Donaciones Comerciales</span>
            <span>·</span>
            <span className="text-emerald-700 dark:text-emerald-400">Protección Activa de Especies Silvestres</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
