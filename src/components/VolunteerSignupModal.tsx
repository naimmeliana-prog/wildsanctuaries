import React, { useState } from 'react';
import { Sanctuary } from '../types';
import { UserProfile, saveStoredUser } from '../utils/offlineStorage';
import { X, ShieldCheck, Heart, User, Mail, Calendar, Phone, CheckCircle2 } from 'lucide-react';

interface VolunteerSignupModalProps {
  sanctuary: Sanctuary;
  user: UserProfile;
  onClose: () => void;
  onSuccess: (updatedUser: UserProfile) => void;
  language: 'es' | 'en';
}

export const VolunteerSignupModal: React.FC<VolunteerSignupModalProps> = ({
  sanctuary,
  user,
  onClose,
  onSuccess,
  language
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserProfile['role']>(user.role);
  const [phone, setPhone] = useState('+34 612 345 678');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [skillsSelected, setSkillsSelected] = useState<string[]>(['Primeros auxilios', 'Mapeo GPS']);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSkill = (skill: string) => {
    if (skillsSelected.includes(skill)) {
      setSkillsSelected(skillsSelected.filter(s => s !== skill));
    } else {
      setSkillsSelected([...skillsSelected, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !agreedTerms) return;

    const newBadgeId = user.volunteerBadgeId || `WS-VOL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const updatedUser: UserProfile = {
      name,
      email,
      role,
      fieldStation: `${sanctuary.name} (${sanctuary.country})`,
      volunteerBadgeId: newBadgeId
    };

    saveStoredUser(updatedUser);
    setSubmitted(true);

    setTimeout(() => {
      onSuccess(updatedUser);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
              {sanctuary.name}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'es' ? 'Inscripción de Voluntariado en Terreno' : 'Field Volunteer Registration'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'es' ? '¡Registro de Voluntario Confirmado!' : 'Volunteer Registration Confirmed!'}
            </h4>
            <p className="text-xs text-slate-500 font-mono">
              Credencial emitida: {user.volunteerBadgeId}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white block mb-0.5">
                {language === 'es' ? 'Política de Voluntariado:' : 'Volunteering Policy:'}
              </strong>
              {language === 'es'
                ? 'Este programa no requiere pagos turísticos ni donaciones monetarias. El compromiso es 100% de dedicación en turnos de monitoreo y tareas asignadas por el biólogo líder.'
                : 'No tourist fees or donations required. The commitment is 100% dedicated field shifts assigned by the project biologist.'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Nombre y Apellidos</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Teléfono / Radio Emergencia</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Rol Operativo</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="volunteer">Voluntario/a General</option>
                  <option value="biologist">Biólogo/a de Apoyo</option>
                  <option value="ranger">Ranger de Patrulla</option>
                  <option value="coordinator">Coordinador de Base</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Fecha de Llegada</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Estancia (mín. {sanctuary.volunteerProgram.minDays} días)
                </label>
                <input
                  type="number"
                  min={Math.ceil(sanctuary.volunteerProgram.minDays / 7)}
                  max="24"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Habilidades de Terreno Disponibles
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Primeros auxilios', 
                  'Mapeo GPS', 
                  'Conducción 4x4', 
                  'Veterinaria básica', 
                  'Natación en mar abierto', 
                  'Cámaras trampa', 
                  'Escalada / Altura'
                ].map(skill => {
                  const active = skillsSelected.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2 py-1 text-[11px] font-mono border transition-colors ${
                        active 
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent font-medium' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {active ? '✓ ' : ''}{skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                Entiendo los rigores del trabajo en hábitats de fauna salvaje, cumpliré los protocolos de bioseguridad y confirmo que no realizaré actividades no autorizadas.
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreedTerms}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-semibold uppercase tracking-wider text-xs transition-colors"
            >
              {language === 'es' ? 'Confirmar Registro de Voluntariado' : 'Confirm Volunteer Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
