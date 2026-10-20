import React, { useState } from 'react';
import { Sanctuary, VolunteerReview } from '../types';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Radio, 
  ExternalLink, 
  Star, 
  UserCheck, 
  Award, 
  FileText, 
  AlertTriangle,
  Send,
  X
} from 'lucide-react';

interface SanctuaryDetailProps {
  sanctuary: Sanctuary;
  reviews: VolunteerReview[];
  onAddReview: (review: VolunteerReview) => void;
  onOpenVolunteerSignup: (s: Sanctuary) => void;
  onClose: () => void;
  language: 'es' | 'en';
}

export const SanctuaryDetail: React.FC<SanctuaryDetailProps> = ({
  sanctuary,
  reviews,
  onAddReview,
  onOpenVolunteerSignup,
  onClose,
  language
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRole, setReviewRole] = useState('Voluntario/a de Campo');
  const [reviewCountry, setReviewCountry] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewWeeks, setReviewWeeks] = useState(4);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTasks, setReviewTasks] = useState('Monitoreo telemétrico, Cámaras trampa');

  const sanctuaryReviews = reviews.filter(r => r.sanctuaryId === sanctuary.id);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    const newRev: VolunteerReview = {
      id: `rev-${Date.now()}`,
      sanctuaryId: sanctuary.id,
      sanctuaryName: sanctuary.name,
      authorName: reviewAuthor,
      authorRole: reviewRole,
      authorCountry: reviewCountry || (language === 'es' ? 'Internacional' : 'International'),
      rating: reviewRating,
      date: new Date().toISOString().slice(0, 10),
      durationWeeks: reviewWeeks,
      comment: reviewComment,
      verifiedVolunteer: true,
      tasksPerformed: reviewTasks.split(',').map(t => t.trim()).filter(Boolean)
    };

    onAddReview(newRev);
    setShowReviewForm(false);
    setReviewComment('');
    setReviewAuthor('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      {/* Top Banner Image with Overlay */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-950">
        <img
          src={sanctuary.imageUrl}
          alt={sanctuary.name}
          className="w-full h-full object-cover opacity-85"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white transition-colors border border-white/20"
          aria-label="Cerrar detalle"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono mb-2">
            <span>{sanctuary.country}</span>
            <span aria-hidden="true">·</span>
            <span>{sanctuary.continent}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-semibold">{sanctuary.iucnStatus}</span>
            <span aria-hidden="true">·</span>
            <span>Fundado {sanctuary.foundedYear}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {sanctuary.name}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {sanctuary.locationName}
            </span>
            <span className="flex items-center gap-1 font-mono text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
              {sanctuary.emergencyRadioChannel}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Key Metrics Strip (anti-slop, clean tabular typography) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-200 dark:border-slate-800 font-mono">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Área de Intervención</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {sanctuary.interventionAreaHectares.toLocaleString()} <span className="text-xs font-normal text-slate-400">ha</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Éxito de Rewilding</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {sanctuary.rewildingSuccessRatePercent}% <span className="text-xs font-normal text-slate-400">liberaciones</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Patrullas Activas</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {sanctuary.activePatrolUnits} <span className="text-xs font-normal text-slate-400">unidades</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Valoración Voluntarios</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              {sanctuary.rating} <span className="text-xs font-normal text-slate-400">({sanctuary.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Mission & Overview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            {language === 'es' ? 'Misión Científica y Hábitat Natural' : 'Scientific Mission & Natural Habitat'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {sanctuary.description}
          </p>

          {/* Rescued Wild Species List (strictly wildlife) */}
          <div className="pt-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              {language === 'es' ? 'Especies Silvestres Protegidas' : 'Protected Wild Species'}
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {sanctuary.rescuedAnimalTypes.map((specie, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {specie}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Biologist Section */}
        <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col sm:flex-row items-start gap-4">
          <img
            src={sanctuary.leadBiologist.avatar}
            alt={sanctuary.leadBiologist.name}
            className="w-16 h-16 object-cover rounded-none border border-slate-300 dark:border-slate-700 shrink-0"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {language === 'es' ? 'Biólogo/a a Cargo del Proyecto' : 'Lead Project Biologist'}
              </div>
              <span className="text-xs font-mono text-slate-400">{sanctuary.leadBiologist.yearsInField} años en campo</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {sanctuary.leadBiologist.name}
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {sanctuary.leadBiologist.title} · {sanctuary.leadBiologist.institution}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              {sanctuary.leadBiologist.bio}
            </p>
            <div className="pt-2 text-xs font-mono text-slate-500 flex items-center gap-3">
              <span>{sanctuary.leadBiologist.publicationsCount} publicaciones científicas</span>
              <a href={`mailto:${sanctuary.leadBiologist.contactEmail}`} className="text-emerald-700 dark:text-emerald-400 hover:underline">
                {sanctuary.leadBiologist.contactEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Volunteer Field Program Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'es' ? 'Programa de Voluntariado en Terreno' : 'Field Volunteer Program'}
            </h3>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
              {language === 'es' ? 'Sin cuotas turísticas ni donaciones' : 'No tourist fees or donations'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Régimen y Horarios</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-mono">
                <li>· Estancia mínima: {sanctuary.volunteerProgram.minDays} días (Máx. {sanctuary.volunteerProgram.maxDays} días)</li>
                <li>· Carga horaria: {sanctuary.volunteerProgram.weeklyHours} horas por semana</li>
                <li>· Alojamiento: {sanctuary.volunteerProgram.accommodationType}</li>
                <li>· Alimentación: {sanctuary.volunteerProgram.dietProvided}</li>
              </ul>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <strong>Cronograma diario:</strong> {sanctuary.volunteerProgram.dailyScheduleOverview}
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Requisitos y Labores de Campo</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Tareas asignadas:</span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {sanctuary.volunteerProgram.tasksIncluded.map((task, i) => (
                      <li key={i}>· {task}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Habilidades requeridas:</span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {sanctuary.volunteerProgram.skillsRequired.map((skill, i) => (
                      <li key={i}>· {skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action to View on Google Maps */}
          <div className="flex items-center gap-4 pt-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${sanctuary.lat},${sanctuary.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'}</span>
            </a>
          </div>
        </div>

        {/* Volunteer Reviews & Personal Experiences Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                {language === 'es' ? 'Experiencias de Voluntarios en Terreno' : 'Field Volunteer Experiences'}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {sanctuaryReviews.length} {language === 'es' ? 'reseñas verificadas' : 'verified reviews'}
              </span>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs font-medium py-1.5 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              {showReviewForm 
                ? (language === 'es' ? 'Cancelar Reseña' : 'Cancel Review') 
                : (language === 'es' ? '+ Añadir Mi Experiencia' : '+ Add My Experience')}
            </button>
          </div>

          {/* Add Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Ej. Martín Soler"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Rol / Especialidad</label>
                  <input
                    type="text"
                    value={reviewRole}
                    onChange={(e) => setReviewRole(e.target.value)}
                    placeholder="Ej. Estudiante de Biología"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Estancia (Semanas)</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={reviewWeeks}
                    onChange={(e) => setReviewWeeks(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Labores realizadas (separadas por coma)</label>
                <input
                  type="text"
                  value={reviewTasks}
                  onChange={(e) => setReviewTasks(e.target.value)}
                  placeholder="Ej. Radiotelemetría, mantenimiento cámaras trampa, censo"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Experiencia y Recomendaciones para Futuros Voluntarios</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Detalla las condiciones reales del terreno, rutinas de campo y preparación recomendada..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 mr-2">Puntuación:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-sm ${reviewRating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors"
                >
                  Publicar Reseña
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            {sanctuaryReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                {language === 'es' ? 'Aún no hay reseñas registradas para este santuario.' : 'No reviews recorded for this sanctuary yet.'}
              </p>
            ) : (
              sanctuaryReviews.map((rev) => (
                <div key={rev.id} className="p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.authorName}</span>
                        <span className="text-xs text-slate-400 font-mono">· {rev.authorCountry}</span>
                        {rev.verifiedVolunteer && (
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                            [Voluntariado Verificado · {rev.durationWeeks} sem]
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{rev.authorRole}</div>
                    </div>
                    <div className="flex items-center text-amber-500 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  {rev.tasksPerformed && rev.tasksPerformed.length > 0 && (
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      <span className="text-slate-400">Tareas: </span>
                      {rev.tasksPerformed.join(' · ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
