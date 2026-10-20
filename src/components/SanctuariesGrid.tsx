import React, { useState } from 'react';
import { Sanctuary, SpeciesCategory, IUCNStatus } from '../types';
import { Search, Filter, MapPin, Compass, ArrowUpRight, Star, ShieldCheck, ExternalLink } from 'lucide-react';

interface SanctuariesGridProps {
  sanctuaries: Sanctuary[];
  onSelectSanctuary: (s: Sanctuary) => void;
  onApplyVolunteer: (s: Sanctuary) => void;
  language: 'es' | 'en';
}

export const SanctuariesGrid: React.FC<SanctuariesGridProps> = ({
  sanctuaries,
  onSelectSanctuary,
  onApplyVolunteer,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIUCN, setSelectedIUCN] = useState<string>('all');
  const [rescuedTypeSearch, setRescuedTypeSearch] = useState('');

  // Extract all unique countries from sanctuaries list
  const availableCountries = Array.from(new Set(sanctuaries.map(s => s.country))).sort();

  const filteredSanctuaries = sanctuaries.filter(s => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCountry = s.country.toLowerCase().includes(q);
      const matchSpecies = s.rescuedAnimalTypes.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchCountry && !matchSpecies) return false;
    }

    // Country filter
    if (selectedCountry !== 'all' && s.country !== selectedCountry) return false;

    // Continent
    if (selectedContinent !== 'all' && s.continent !== selectedContinent) return false;

    // Category
    if (selectedCategory !== 'all' && !s.speciesCategories.includes(selectedCategory as SpeciesCategory)) return false;

    // IUCN
    if (selectedIUCN !== 'all' && s.iucnStatus !== selectedIUCN) return false;

    // Rescued animal type
    if (rescuedTypeSearch.trim()) {
      const rq = rescuedTypeSearch.toLowerCase();
      const hasType = s.rescuedAnimalTypes.some(t => t.toLowerCase().includes(rq));
      if (!hasType) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls Strip */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'es' ? 'Directorio Mundial de Santuarios de Fauna Silvestre' : 'Global Wildlife Sanctuaries Directory'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'es'
                ? 'Espacios de conservación activos, sin ánimo de lucro ni donaciones comerciales. Solo fauna silvestre amenazada.'
                : 'Active wildlife reserves and rescue bases. Zero commercial tourist donations. Strictly wild fauna.'}
            </p>
          </div>

          <div className="font-mono text-xs text-slate-500">
            {filteredSanctuaries.length} {language === 'es' ? 'santuarios registrados' : 'sanctuaries found'}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Text Search */}
          <div className="relative lg:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'es' ? 'Buscar santuario o ciudad...' : 'Search sanctuary or city...'}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              aria-label="Filtrar por país específico"
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">{language === 'es' ? 'Todos los países' : 'All countries'}</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>
                  {country} ({sanctuaries.filter(s => s.country === country).length})
                </option>
              ))}
            </select>
          </div>

          {/* Rescued Animal Type Search */}
          <div>
            <input
              type="text"
              value={rescuedTypeSearch}
              onChange={(e) => setRescuedTypeSearch(e.target.value)}
              placeholder={language === 'es' ? 'Animal rescatado...' : 'Rescued animal...'}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Species Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por grupo de fauna silvestre"
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">{language === 'es' ? 'Todos los grupos de fauna' : 'All wildlife groups'}</option>
              <option value="primates">Primates</option>
              <option value="big_cats">Grandes Felinos</option>
              <option value="megaherbivores">Paquidermos & Sabana</option>
              <option value="marine_wildlife">Fauna Marina</option>
              <option value="raptors_birds">Aves & Rapaces</option>
              <option value="reptiles_amphibians">Reptiles & Anfibios</option>
            </select>
          </div>

          {/* Continent Filter */}
          <div>
            <select
              value={selectedContinent}
              onChange={(e) => {
                setSelectedContinent(e.target.value);
                setSelectedCountry('all');
              }}
              aria-label="Filtrar por continente o región"
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">
                {language === 'es' ? 'Todos los continentes' : 'All continents'} ({sanctuaries.length})
              </option>
              <option value="Africa">
                {language === 'es' ? 'África' : 'Africa'} ({sanctuaries.filter(s => s.continent === 'Africa').length})
              </option>
              <option value="Americas">
                {language === 'es' ? 'América (Norte, Centro, Sur)' : 'Americas'} ({sanctuaries.filter(s => s.continent === 'Americas').length})
              </option>
              <option value="Asia">
                {language === 'es' ? 'Asia & Eurasia' : 'Asia & Eurasia'} ({sanctuaries.filter(s => s.continent === 'Asia').length})
              </option>
              <option value="Europe">
                {language === 'es' ? 'Europa & Países Nórdicos' : 'Europe & Nordic'} ({sanctuaries.filter(s => s.continent === 'Europe').length})
              </option>
              <option value="Oceania">
                {language === 'es' ? 'Oceanía' : 'Oceania'} ({sanctuaries.filter(s => s.continent === 'Oceania').length})
              </option>
            </select>
          </div>

          {/* IUCN Status */}
          <div>
            <select
              value={selectedIUCN}
              onChange={(e) => setSelectedIUCN(e.target.value)}
              aria-label="Filtrar por estado de conservación UICN"
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">{language === 'es' ? 'Cualquier estado UICN' : 'Any IUCN status'}</option>
              <option value="Critically Endangered">En Peligro Crítico</option>
              <option value="Endangered">En Peligro</option>
              <option value="Vulnerable">Vulnerable</option>
            </select>
          </div>
        </div>

        {/* Quick Country Filter Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-mono text-slate-400 mr-1">
            {language === 'es' ? 'Acceso rápido por país:' : 'Quick country filter:'}
          </span>
          <button
            onClick={() => setSelectedCountry('all')}
            className={`px-2 py-0.5 font-mono text-[11px] transition-colors ${selectedCountry === 'all' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'es' ? 'Todos' : 'All'}
          </button>
          {availableCountries.map(c => {
            const count = sanctuaries.filter(s => s.country === c).length;
            return (
              <button
                key={c}
                onClick={() => setSelectedCountry(selectedCountry === c ? 'all' : c)}
                className={`px-2 py-0.5 font-mono text-[11px] transition-colors ${selectedCountry === c ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Sanctuaries */}
      {filteredSanctuaries.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm text-slate-500">
            {language === 'es' ? 'No se encontraron santuarios con los criterios seleccionados.' : 'No sanctuaries found matching your filters.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedContinent('all');
              setSelectedCategory('all');
              setSelectedIUCN('all');
              setRescuedTypeSearch('');
            }}
            className="text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {language === 'es' ? 'Restablecer todos los filtros' : 'Reset all filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSanctuaries.map((s) => (
            <div
              key={s.id}
              className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between group hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Location strip */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {s.country}
                    </span>
                    <span className="font-mono text-[11px] text-amber-300">
                      {s.iucnStatus}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  <div>
                    {/* Quiet unboxed metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-1">
                      <span>{s.continent}</span>
                      <span aria-hidden="true">·</span>
                      <span>Fundado {s.foundedYear}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{s.rewildingSuccessRatePercent}% rewilding</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {s.name}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>

                  {/* Rescued Wild Animals snippet */}
                  <div className="text-[11px] font-mono text-slate-500">
                    <span className="text-slate-400">Fauna: </span>
                    {s.rescuedAnimalTypes.join(' · ')}
                  </div>

                  {/* Official Website URL */}
                  {s.websiteUrl && (
                    <div className="text-[11px] font-mono truncate">
                      <span className="text-slate-400">Web: </span>
                      <a
                        href={s.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{s.websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {/* Volunteer program specs strip */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs font-mono grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Estancia Mín.</span>
                      {s.volunteerProgram.minDays} días
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Dedicación</span>
                      {s.volunteerProgram.weeklyHours} h/sem
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => onSelectSanctuary(s)}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  {language === 'es' ? 'Ver Ficha Completa' : 'View Full Profile'}
                </button>
                {s.websiteUrl && (
                  <a
                    href={s.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.websiteUrl}
                    className="py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'es' ? 'Web' : 'Web'}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
