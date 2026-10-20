export type SpeciesCategory = 
  | 'primates' 
  | 'big_cats' 
  | 'megaherbivores' 
  | 'marine_wildlife' 
  | 'raptors_birds' 
  | 'reptiles_amphibians';

export type IUCNStatus = 'Critically Endangered' | 'Endangered' | 'Vulnerable';

export interface Biologist {
  id: string;
  name: string;
  title: string;
  institution: string;
  avatar: string;
  bio: string;
  publicationsCount: number;
  yearsInField: number;
  primarySpecies: string;
  contactEmail: string;
}

export interface VolunteerProgram {
  minDays: number;
  maxDays: number;
  weeklyHours: number;
  accommodationType: string;
  skillsRequired: string[];
  tasksIncluded: string[];
  dietProvided: string;
  safetyBriefingRequired: boolean;
  languagesRequired: string[];
  dailyScheduleOverview: string;
}

export interface Sanctuary {
  id: string;
  name: string;
  country: string;
  continent: 'Africa' | 'Asia' | 'Americas' | 'Europe' | 'Oceania';
  locationName: string;
  lat: number;
  lng: number;
  imageUrl: string;
  speciesCategories: SpeciesCategory[];
  rescuedAnimalTypes: string[];
  iucnStatus: IUCNStatus;
  leadBiologist: Biologist;
  description: string;
  interventionAreaHectares: number;
  volunteerProgram: VolunteerProgram;
  rating: number;
  reviewsCount: number;
  activePatrolUnits: number;
  foundedYear: number;
  rewildingSuccessRatePercent: number;
  verifiedOfficial: boolean;
  contactPhone: string;
  emergencyRadioChannel: string;
}

export interface VolunteerReview {
  id: string;
  sanctuaryId: string;
  sanctuaryName: string;
  authorName: string;
  authorRole: string;
  authorCountry: string;
  rating: number;
  date: string;
  durationWeeks: number;
  comment: string;
  verifiedVolunteer: boolean;
  tasksPerformed: string[];
}

export interface VolunteerTask {
  id: string;
  sanctuaryId: string;
  sanctuaryName: string;
  title: string;
  category: 'monitoring' | 'habitat' | 'veterinary' | 'patrol_support' | 'nutrition';
  description: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'full_day' | 'night_watch';
  requiredVolunteers: number;
  assignedVolunteers: string[];
  status: 'open' | 'in_progress' | 'completed';
  urgency: 'low' | 'normal' | 'urgent';
}

export interface GroupActivity {
  id: string;
  sanctuaryId: string;
  sanctuaryName: string;
  title: string;
  date: string;
  time: string;
  description: string;
  locationDetails: string;
  leadScientist: string;
  type: 'census' | 'habitat_restoration' | 'camera_trap_check' | 'anti_poaching_patrol' | 'awareness_session';
  capacity: number;
  enrolledVolunteers: string[];
}

export interface FieldIncident {
  id: string;
  sanctuaryId: string;
  sanctuaryName: string;
  reportedBy: string;
  reporterRole: string;
  timestamp: string;
  type: 'poaching_threat' | 'injured_wildlife' | 'illegal_snare' | 'wildfire_hazard' | 'boundary_breach';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  lat: number;
  lng: number;
  description: string;
  status: 'pending_offline' | 'synced' | 'investigating' | 'resolved';
  animalSpeciesInvolved?: string;
  notes?: string;
}

export interface SuccessStory {
  id: string;
  animalName: string;
  species: string;
  scientificName: string;
  sanctuaryId: string;
  sanctuaryName: string;
  rescueYear: number;
  releaseYear: number;
  imageUrl: string;
  story: string;
  trackingStatus: 'wild_satellite_active' | 'reproducing_in_wild' | 'ranger_monitored';
  keyImpact: string;
}

export interface EnvironmentalStats {
  totalProtectedHectares: number;
  totalWildAnimalsRehabilitated: number;
  totalReturnedToWild: number;
  activeSanctuaries: number;
  monthlyPatrolKilometers: number;
  activeCameraTraps: number;
  volunteerHoursLoggedThisMonth: number;
  speciesReproductionInWild: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: string;
  avatarText: string;
  text: string;
  timestamp: string;
  isOfficialCoordinator?: boolean;
}

export interface FieldNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  urgency: 'critical' | 'alert' | 'info';
  type: 'incident' | 'activity' | 'task';
  read: boolean;
  linkTab?: string;
}

export type AppTab = 
  | 'explore_map'
  | 'sanctuaries_list'
  | 'volunteer_hub'
  | 'group_calendar'
  | 'incident_reports'
  | 'biologists'
  | 'rewilding_stories'
  | 'impact_analytics';
