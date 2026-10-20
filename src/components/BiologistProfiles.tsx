import React from 'react';
import { Biologist, Sanctuary } from '../types';
import { Award, BookOpen, Mail, MapPin, Calendar, Microscope, Shield } from 'lucide-react';

interface BiologistProfilesProps {
  biologists: Biologist[];
  sanctuaries: Sanctuary[];
  language: 'es' | 'en';
}

export const BiologistProfiles: React.FC<BiologistProfilesProps> = ({
  biologists,
  sanctuaries,
  language
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          {language === 'es' ? 'Cuerpo Científico & Directores de Conservación' : 'Scientific Board & Conservation Directors'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'es'
            ? 'Biólogos de campo, veterinarios de fauna salvaje y primatólogos responsables de los programas de rescate, monitoreo telemétrico y supervisión técnica de voluntarios.'
            : 'Field biologists, wildlife veterinarians, and primatologists leading rescue programs, telemetry tracking, and volunteer supervision.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {biologists.map((bio) => {
          const sanctuary = sanctuaries.find(s => s.leadBiologist.id === bio.id);

          return (
            <div 
              key={bio.id}
              className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <img
                    src={bio.avatar}
                    alt={bio.name}
                    className="w-20 h-20 object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                      {bio.yearsInField} {language === 'es' ? 'Años en Terreno' : 'Years in Field'}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {bio.name}
                    </h4>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {bio.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {bio.institution}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 block text-[10px] uppercase mb-0.5">Especie Principal de Investigación</span>
                  <strong className="text-slate-900 dark:text-white italic">{bio.primarySpecies}</strong>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {bio.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{bio.publicationsCount} {language === 'es' ? 'papers científicos' : 'scientific papers'}</span>
                </div>

                <a
                  href={`mailto:${bio.contactEmail}`}
                  className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{bio.contactEmail}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
