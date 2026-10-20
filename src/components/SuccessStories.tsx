import React from 'react';
import { SuccessStory } from '../types';
import { Radio, Calendar, Compass, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface SuccessStoriesProps {
  stories: SuccessStory[];
  language: 'es' | 'en';
}

export const SuccessStories: React.FC<SuccessStoriesProps> = ({
  stories,
  language
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          {language === 'es' ? 'Casos de Éxito en Rewilding & Reintroducción Silvestre' : 'Rewilding & Wildlife Release Success Cases'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'es'
            ? 'Monitoreo telemétrico de ejemplares salvajes rehabilitados y reintroducidos exitosamente en sus hábitats naturales sin dependencia humana.'
            : 'Telemetry tracking of wild specimens rehabilitated and released back into natural ecosystems without human dependence.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map((story) => (
          <div 
            key={story.id}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-56 w-full bg-slate-950 overflow-hidden">
              <img
                src={story.imageUrl}
                alt={story.animalName}
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-emerald-400 font-mono text-[11px] px-2 py-0.5 border border-emerald-900/40">
                {story.trackingStatus === 'wild_satellite_active' && (language === 'es' ? 'Satélite GPS Activo' : 'Satellite GPS Active')}
                {story.trackingStatus === 'reproducing_in_wild' && (language === 'es' ? 'Reproducción en Libertad' : 'Breeding in the Wild')}
                {story.trackingStatus === 'ranger_monitored' && (language === 'es' ? 'Monitoreo por Guardaparques' : 'Ranger Monitored')}
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-xs font-mono text-slate-300">
                  {story.scientificName} · Rescate {story.rescueYear} / Liberación {story.releaseYear}
                </div>
                <h4 className="text-xl font-bold tracking-tight">
                  {story.animalName} ({story.species})
                </h4>
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400">
                  {story.sanctuaryName}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {story.story}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-emerald-800 dark:text-emerald-400">
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">
                  {language === 'es' ? 'Impacto Telemétrico Comprobado' : 'Telemetry Proof'}
                </span>
                {story.keyImpact}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
