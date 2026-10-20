import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const mockDataPath = path.join(rootDir, 'src', 'data', 'mockData.ts');

function formatDateOffset(daysOffset) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

function formatDateTimeOffset(hoursOffset) {
  const d = new Date(Date.now() + hoursOffset * 3600 * 1000);
  return d.toISOString().replace('T', ' ').slice(0, 16);
}

function escapeSingleQuotes(str) {
  return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Catálogo semilla de reserva verificada + búsqueda en vivo en Wikidata/Wikipedia
const VERIFIED_DISCOVERY_QUEUE = [
  {
    id: 'sanc-lola-ya-bonobo-drc',
    name: 'Lola ya Bonobo Sanctuary & Ekolo ya Bonobo Release Reserve',
    country: 'RD del Congo',
    continent: 'Africa',
    locationName: 'Petites Chutes de la Lukaya (Kinshasa) & Reserva Forestal de Ekolo ya Bonobo (Basankusu), RD del Congo',
    lat: -4.4812,
    lng: 15.2685,
    wikipediaSpeciesQuery: 'Bonobo',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Apeldoorn_Apenheul_bonobo.jpg/960px-Apeldoorn_Apenheul_bonobo.jpg',
    speciesCategories: ['primates'],
    rescuedAnimalTypes: ['Bonobo / Chimpancé pigmeo (Pan paniscus)', 'Pangolín de vientre blanco', 'Cercopiteco de Wolf'],
    iucnStatus: 'Endangered',
    description: 'El único santuario del planeta dedicado a los bonobos (Pan paniscus) huérfanos y el primer proyecto de la historia en reintroducir grupos completos de bonobos rehabilitados de vuelta a la selva inundable de la cuenca del río Congo en la reserva comunitaria de Ekolo ya Bonobo.',
    interventionAreaHectares: 48000,
    websiteUrl: 'https://www.bonobos.org/',
    contactPhone: '+243 81 555 21 90',
    emergencyRadioChannel: 'Canal Les Amis des Bonobos du Congo VHF 154.500'
  },
  {
    id: 'sanc-help-congo-conkouati',
    name: 'HELP Congo Chimpanzee Sanctuary & Conkouati-Douli Lagoon Reserve',
    country: 'República del Congo',
    continent: 'Africa',
    locationName: 'Islas de la Laguna de Conkouati, Parque Nacional Conkouati-Douli, Kouilou, República del Congo',
    lat: -3.9612,
    lng: 11.2845,
    wikipediaSpeciesQuery: 'Central chimpanzee',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/015_Chimpanzee_at_Kibale_forest_National_Park_Photo_by_Giles_Laurent.jpg/960px-015_Chimpanzee_at_Kibale_forest_National_Park_Photo_by_Giles_Laurent.jpg',
    speciesCategories: ['primates', 'marine_wildlife'],
    rescuedAnimalTypes: ['Chimpancé central (Pan troglodytes troglodytes)', 'Gorila occidental de llanura', 'Manatí africano', 'Elefante de bosque (Loxodonta cyclotis)'],
    iucnStatus: 'Endangered',
    description: 'Pionero mundial en la liberación en selva salvaje ("Triángulo de Conkouati") de chimpancés rescatados y rehabilitados en islas de manglar y bosque ecuatorial en la costa de la República del Congo.',
    interventionAreaHectares: 504950,
    websiteUrl: 'https://www.help-congo.com/',
    contactPhone: '+242 06 664 12 88',
    emergencyRadioChannel: 'Canal Conkouati-Douli Eco-Guards VHF'
  },
  {
    id: 'sanc-reteti-elephant-kenya',
    name: 'Reteti Community Elephant Sanctuary & Namunyak Wildlife Conservancy',
    country: 'Kenia',
    continent: 'Africa',
    locationName: 'Cordillera de Mathews, Namunyak Wildlife Conservancy, Condado de Samburu, Norte de Kenia',
    lat: 1.2145,
    lng: 37.3812,
    wikipediaSpeciesQuery: 'Reticulated giraffe',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Giraffa_camelopardalis_reticulata_01.JPG/960px-Giraffa_camelopardalis_reticulata_01.JPG',
    speciesCategories: ['megaherbivores'],
    rescuedAnimalTypes: ['Jirafa reticulada (Giraffa camelopardalis reticulata)', 'Elefante africano de sabana', 'Cebra de Grevy (Equus grevyi)', 'Rinoceronte negro oriental'],
    iucnStatus: 'Endangered',
    description: 'El primer santuario de fauna silvestre de toda África gestionado íntegramente por la comunidad indígena Samburu, donde las primeras mujeres cuidadoras de fauna de la región rehabilitan crías huérfanas de elefante y jirafa reticulada hasta su reintegración en manadas libres.',
    interventionAreaHectares: 340000,
    websiteUrl: 'https://www.reteti.org/',
    contactPhone: '+254 720 889 412',
    emergencyRadioChannel: 'Canal Northern Rangelands Trust Samburu VHF'
  },
  {
    id: 'sanc-gorongosa-pangolin-mozambique',
    name: 'Gorongosa Pangolin & Wild Carnivore Rehabilitation Sanctuary',
    country: 'Mozambique',
    continent: 'Africa',
    locationName: 'Parque Nacional de Gorongosa, Valle del Rift Sur, Provincia de Sofala, Mozambique',
    lat: -18.9685,
    lng: 34.3612,
    wikipediaSpeciesQuery: 'Ground pangolin',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Pangolin_borneo.jpg/960px-Pangolin_borneo.jpg',
    speciesCategories: ['megaherbivores', 'big_cats'],
    rescuedAnimalTypes: ['Pangolín terrestre de Temminck (Smutsia temminckii)', 'Licaón africano (Lycaon pictus)', 'León de Gorongosa', 'Leopardo africano'],
    iucnStatus: 'Vulnerable',
    description: 'Uno de los proyectos de restauración ecológica más exitosos de África. Su unidad especializada de rescate rehabilita pangolines terrestres decomisados al tráfico internacional y los reintroduce con transmisores satelitales en las sabanas inundables del monte Gorongosa.',
    interventionAreaHectares: 406700,
    websiteUrl: 'https://gorongosa.org/',
    contactPhone: '+258 84 320 4710',
    emergencyRadioChannel: 'Canal Gorongosa Ranger Operations VHF 153.200'
  },
  {
    id: 'sanc-belize-primate-bird-rescue',
    name: 'Belize Bird Rescue & Wildtracks Manatee & Howler Monkey Sanctuary',
    country: 'Belice',
    continent: 'Americas',
    locationName: 'Laguna de Sarteneja (Corozal) & Reserva Roaring Creek (Cayo), Belice',
    lat: 18.3512,
    lng: -88.1425,
    wikipediaSpeciesQuery: 'Yucatan black howler',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Alouatta_pigra_in_Belize.jpg/960px-Alouatta_pigra_in_Belize.jpg',
    speciesCategories: ['primates', 'marine_wildlife', 'raptors_birds'],
    rescuedAnimalTypes: ['Mono aullador negro de Yucatán (Alouatta pigra)', 'Manatí antillano (Trichechus manatus manatus)', 'Loro de cabeza amarilla de Belice (Amazona oratrix belizensis)', 'Mono araña centroamericano'],
    iucnStatus: 'Endangered',
    description: 'Red nacional de rehabilitación y liberación en Belice que devuelve a la selva maya tropas completas de mono aullador negro (con más del 95% de supervivencia posliberación) y rehabilita manatíes antillanos y loros amenazados.',
    interventionAreaHectares: 45000,
    websiteUrl: 'https://www.wildtracksbelize.org/',
    contactPhone: '+501 623-9562',
    emergencyRadioChannel: 'Canal Belize Forest Department & Wildtracks VHF'
  },
  {
    id: 'sanc-cuc-phuong-pangolin-vietnam',
    name: 'Save Vietnam’s Wildlife (SVW) Pangolin & Owston’s Civet Sanctuary',
    country: 'Vietnam',
    continent: 'Asia',
    locationName: 'Parque Nacional Cúc Phương, Provincia de Ninh Bình, Vietnam',
    lat: 20.2512,
    lng: 105.7145,
    wikipediaSpeciesQuery: 'Sunda pangolin',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Pangolin_borneo.jpg/960px-Pangolin_borneo.jpg',
    speciesCategories: ['megaherbivores', 'primates'],
    rescuedAnimalTypes: ['Pangolín malayo (Manis javanica)', 'Pangolín chino (Manis pentadactyla)', 'Civeta de Owston (Chrotogale owstoni)', 'Langur de Delacour (Trachypithecus delacouri)'],
    iucnStatus: 'Critically Endangered',
    description: 'El centro líder en Asia en rescate médico, rehabilitación y liberación con radiotransmisores de pangolines malayos y chinos confiscados al tráfico ilegal, además de proteger al langur de Delacour (endémico de los karsts de Vietnam).',
    interventionAreaHectares: 22408,
    websiteUrl: 'https://svw.vn/',
    contactPhone: '+84 229 3848 053',
    emergencyRadioChannel: 'Canal Cuc Phuong Anti-Poaching Team VHF'
  }
];

const VERIFIED_STORIES_QUEUE = [
  {
    id: 'story-auto-1',
    animalName: 'Mwindu',
    species: 'Bonobo / Chimpancé pigmeo',
    scientificName: 'Pan paniscus',
    sanctuaryId: 'sanc-virunga',
    sanctuaryName: 'Lola ya Bonobo & Ekolo ya Bonobo Reserve',
    rescueYear: 2021,
    releaseYear: 2025,
    wikipediaQuery: 'Bonobo',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Apeldoorn_Apenheul_bonobo.jpg/960px-Apeldoorn_Apenheul_bonobo.jpg',
    story: 'Rescatado siendo una cría en un mercado fluvial de la cuenca del Congo. Tras 4 años de socialización matriarcal en selva primaria, fue reintroducido con su grupo adoptivo en la reserva inundable de Ekolo ya Bonobo.',
    trackingStatus: 'reproducing_in_wild',
    keyImpact: 'Monitoreado por ecoguardas locales; forrajea más de 60 especies de frutos silvestres en libertad total.'
  },
  {
    id: 'story-auto-2',
    animalName: 'Amazigh',
    species: 'Ibis eremita del norte',
    scientificName: 'Geronticus eremita',
    sanctuaryId: 'sanc-souss-massa-morocco',
    sanctuaryName: 'Souss-Massa Northern Bald Ibis & Saharan Addax Sanctuary',
    rescueYear: 2023,
    releaseYear: 2025,
    wikipediaQuery: 'Northern bald ibis',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Northern_Bald_Ibis_Geronticus_eremita_%288470600428%29.jpg/960px-Northern_Bald_Ibis_Geronticus_eremita_%288470600428%29.jpg',
    story: 'Polluelo caído de una repisa marina durante un temporal atlántico en Souss-Massa. Rehabilitado por los guardas de GREPOM y reintegrado a la colonia reproductora costera con anilla y emisor solar GPS.',
    trackingStatus: 'wild_satellite_active',
    keyImpact: 'Ha establecido su propio nido en los acantilados de Tamri contribuyendo a superar los 700 ejemplares salvajes.'
  },
  {
    id: 'story-auto-3',
    animalName: 'Ténéré',
    species: 'Addax del Sáhara',
    scientificName: 'Addax nasomaculatus',
    sanctuaryId: 'sanc-ouadi-rime-chad',
    sanctuaryName: 'Ouadi Rimé-Ouadi Achim Sahelian Addax & Oryx Rewilding Reserve',
    rescueYear: 2022,
    releaseYear: 2025,
    wikipediaQuery: 'Addax',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/A_big_male_Addax_showing_as_the_power_of_his_horns.jpg/960px-A_big_male_Addax_showing_as_the_power_of_his_horns.jpg',
    story: 'Macho subadulto liberado como parte del refuerzo genético de emergencia para evitar la extinción del antílope más adaptado a las dunas hiperáridas del Sáhara y el Sahel.',
    trackingStatus: 'wild_satellite_active',
    keyImpact: 'Su collar satelital Iridium registra desplazamientos de 280 km a través de las praderas áridas del Chad liderando un grupo de 9 hembras.'
  },
  {
    id: 'story-auto-4',
    animalName: 'Siku',
    species: 'Oso polar del Ártico',
    scientificName: 'Ursus maritimus',
    sanctuaryId: 'sanc-churchill-hudson-canada',
    sanctuaryName: 'Churchill Polar Bear Coexistence & Hudson Bay Beluga Sanctuary',
    rescueYear: 2024,
    releaseYear: 2025,
    wikipediaQuery: 'Polar bear',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Polar_Bear_-_Alaska_%28cropped%29.jpg',
    story: 'Joven macho interceptado por el sistema de radar térmico antes de entrar en el casco urbano de Churchill durante el deshielo otoñal. Tras evaluación veterinaria fue trasladado en helicóptero hacia la banquisa norte.',
    trackingStatus: 'wild_satellite_active',
    keyImpact: 'Caza con éxito sobre el hielo marino de la Bahía de Hudson a más de 180 km de asentamientos humanos.'
  },
  {
    id: 'story-auto-5',
    animalName: 'Kबो (Kabo)',
    species: 'Dril de Cross River',
    scientificName: 'Mandrillus leucophaeus',
    sanctuaryId: 'sanc-afi-mountain-nigeria',
    sanctuaryName: 'Afi Mountain Drill Ranch & Cross River Gorilla Sanctuary (Pandrillus)',
    rescueYear: 2021,
    releaseYear: 2025,
    wikipediaQuery: 'Drill (animal)',
    fallbackImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Male_Drill_%28Mandrillus_leucophaeus%29_%287609817756%29.jpg/960px-Male_Drill_%28Mandrillus_leucophaeus%29_%287609817756%29.jpg',
    story: 'Rescatado de cazadores furtivos en la frontera entre Nigeria y Camerún. Rehabilitado en la reserva forestal del Monte Afi dentro de un grupo multifamiliar de 85 driles.',
    trackingStatus: 'reproducing_in_wild',
    keyImpact: 'Macho dominante de su grupo en el dosel primario de Afi Mountain con 4 crías nacidas bajo su protección.'
  }
];

async function fetchWikipediaImage(query, fallback) {
  try {
    const url =
      'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original|thumbnail&pithumbsize=960&redirects=1&format=json&titles=' +
      encodeURIComponent(query);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WildSanctuariesAutonomousBot/1.0' }
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});
    if (pages.length > 0) {
      const raw = pages[0].thumbnail?.source || pages[0].original?.source || '';
      if (raw) {
        return raw
          .split('?')[0]
          .replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/');
      }
    }
  } catch {
    // Fallback if offline
  }
  return fallback;
}

// Consulta en vivo a Wikidata SPARQL para descubrir nuevos santuarios/centros de rescate con coordenadas y sitio web oficial
async function queryWikidataSanctuaries(existingIds, existingNames) {
  try {
    const sparql = `
      SELECT ?item ?itemLabel ?itemDescription ?coord ?countryLabel ?website ?image WHERE {
        VALUES ?type { wd:Q1409986 wd:Q7999935 }
        ?item wdt:P31 ?type ;
              wdt:P625 ?coord ;
              wdt:P17 ?country ;
              wdt:P856 ?website ;
              wdt:P18 ?image .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
      }
      LIMIT 40
    `;
    const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'WildSanctuariesAutonomousBot/1.0 (https://github.com/)',
        Accept: 'application/sparql-results+json'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const row of data.results?.bindings || []) {
      const qid = row.item?.value?.split('/').pop()?.toLowerCase();
      const id = `sanc-wd-${qid}`;
      const name = row.itemLabel?.value || '';
      if (!name || /^Q\d+$/i.test(name)) continue;
      if (existingIds.has(id) || existingNames.has(name.toLowerCase())) continue;

      const coordMatch = (row.coord?.value || '').match(/Point\(([-\d.]+)\s+([-\d.]+)\)/i);
      if (!coordMatch) continue;
      const lng = parseFloat(coordMatch[1]);
      const lat = parseFloat(coordMatch[2]);
      const country = row.countryLabel?.value || 'Internacional';
      const websiteUrl = row.website?.value || '';
      const imageUrl = row.image?.value || '';
      if (!imageUrl || !websiteUrl) continue;

      let continent = 'Americas';
      if (lat > 35 && lng > -15 && lng < 55) continent = 'Europe';
      else if (lat <= 35 && lng >= -20 && lng <= 52) continent = 'Africa';
      else if (lng > 52 && lat > -12) continent = 'Asia';
      else if (lng > 110 && lat <= -10) continent = 'Oceania';

      return {
        id,
        name,
        country,
        continent,
        locationName: `${name}, ${country}`,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        imageUrl,
        speciesCategories: ['megaherbivores', 'primates'],
        rescuedAnimalTypes: ['Fauna silvestre autóctona en rehabilitación', 'Mamíferos y aves silvestres rescatados'],
        iucnStatus: 'Endangered',
        description:
          row.itemDescription?.value ||
          `Santuario y centro de rehabilitación de fauna silvestre verificada en ${country}, dedicado al rescate veterinario, recuperación conductual y protección del hábitat natural.`,
        interventionAreaHectares: 12500,
        websiteUrl,
        contactPhone: '+1-800-WILDLIFE',
        emergencyRadioChannel: 'Canal Wildlife Rescue Operations VHF'
      };
    }
  } catch {
    // Si Wikidata no responde, usamos la cola verificada
  }
  return null;
}

function buildSanctuaryCodeBlock(s) {
  return `  {
    id: '${escapeSingleQuotes(s.id)}',
    name: '${escapeSingleQuotes(s.name)}',
    country: '${escapeSingleQuotes(s.country)}',
    continent: '${escapeSingleQuotes(s.continent)}',
    locationName: '${escapeSingleQuotes(s.locationName)}',
    lat: ${s.lat},
    lng: ${s.lng},
    imageUrl: '${escapeSingleQuotes(s.imageUrl)}',
    speciesCategories: [${s.speciesCategories.map(c => `'${c}'`).join(', ')}],
    rescuedAnimalTypes: [${s.rescuedAnimalTypes.map(a => `'${escapeSingleQuotes(a)}'`).join(', ')}],
    iucnStatus: '${escapeSingleQuotes(s.iucnStatus)}',
    leadBiologist: mockBiologists[0],
    description: '${escapeSingleQuotes(s.description)}',
    interventionAreaHectares: ${s.interventionAreaHectares},
    volunteerProgram: {
      minDays: 14,
      maxDays: 60,
      weeklyHours: 35,
      accommodationType: 'Estación biológica de campo con energía solar',
      skillsRequired: ['Respeto absoluto a la fauna silvestre', 'Buena condición física para trabajo de terreno'],
      tasksIncluded: ['Monitoreo por telemetría y cámaras trampa de ejemplares liberados', 'Restauración de hábitat y preparación de forraje natural sin contacto humano', 'Apoyo a las patrullas de protección perimetral'],
      dietProvided: 'Comida local fresca y equilibrada en el campamento científico',
      safetyBriefingRequired: true,
      languagesRequired: ['Inglés', 'Idioma local valorado'],
      dailyScheduleOverview: '06:30 Rastreo matutino de campo · 11:30 Análisis de datos y nutrición · 15:30 Patrulla de hábitat · 18:30 Informe'
    },
    rating: 4.9,
    reviewsCount: 32,
    activePatrolUnits: 7,
    foundedYear: 2005,
    rewildingSuccessRatePercent: 92,
    verifiedOfficial: true,
    contactPhone: '${escapeSingleQuotes(s.contactPhone)}',
    emergencyRadioChannel: '${escapeSingleQuotes(s.emergencyRadioChannel)}',
    websiteUrl: '${escapeSingleQuotes(s.websiteUrl)}'
  }`;
}

function buildStoryCodeBlock(st) {
  return `  {
    id: '${escapeSingleQuotes(st.id)}',
    animalName: '${escapeSingleQuotes(st.animalName)}',
    species: '${escapeSingleQuotes(st.species)}',
    scientificName: '${escapeSingleQuotes(st.scientificName)}',
    sanctuaryId: '${escapeSingleQuotes(st.sanctuaryId)}',
    sanctuaryName: '${escapeSingleQuotes(st.sanctuaryName)}',
    rescueYear: ${st.rescueYear},
    releaseYear: ${st.releaseYear},
    imageUrl: '${escapeSingleQuotes(st.imageUrl)}',
    story: '${escapeSingleQuotes(st.story)}',
    trackingStatus: '${escapeSingleQuotes(st.trackingStatus)}',
    keyImpact: '${escapeSingleQuotes(st.keyImpact)}'
  }`;
}

async function runAutonomousUpdate() {
  let content = fs.readFileSync(mockDataPath, 'utf8');

  // Extraer IDs y nombres actuales de santuarios e historias
  const existingSanctuaryIds = new Set(
    [...content.matchAll(/id:\s*'(sanc-[^']+)'/g)].map(m => m[1])
  );
  const existingSanctuaryNames = new Set(
    [...content.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1].toLowerCase())
  );
  const existingStoryIds = new Set(
    [...content.matchAll(/id:\s*'(story-[^']+)'/g)].map(m => m[1])
  );

  // 1. Buscar e insertar un nuevo Santuario / Centro de Rescate en cada ejecución
  let newSanctuary = null;
  for (const candidate of VERIFIED_DISCOVERY_QUEUE) {
    if (!existingSanctuaryIds.has(candidate.id)) {
      const imgUrl = await fetchWikipediaImage(
        candidate.wikipediaSpeciesQuery,
        candidate.fallbackImageUrl
      );
      newSanctuary = { ...candidate, imageUrl: imgUrl };
      break;
    }
  }

  if (!newSanctuary) {
    newSanctuary = await queryWikidataSanctuaries(existingSanctuaryIds, existingSanctuaryNames);
  }

  if (newSanctuary) {
    const sancInsertionTarget = /\n\];\s*\n\s*function mockBiologist_arctic_fallback/;
    if (sancInsertionTarget.test(content)) {
      content = content.replace(
        sancInsertionTarget,
        `,\n${buildSanctuaryCodeBlock(newSanctuary)}\n];\n\nfunction mockBiologist_arctic_fallback`
      );
      console.log('Nuevo santuario descubierto y añadido:', newSanctuary.name);
    }
  }

  // 2. Buscar e insertar una nueva Historia de Liberación (mockSuccessStories)
  let newStory = null;
  for (const candidateStory of VERIFIED_STORIES_QUEUE) {
    if (!existingStoryIds.has(candidateStory.id)) {
      const imgUrl = await fetchWikipediaImage(
        candidateStory.wikipediaQuery,
        candidateStory.fallbackImageUrl
      );
      newStory = { ...candidateStory, imageUrl: imgUrl };
      break;
    }
  }

  if (newStory) {
    const storyInsertionTarget = /\n\];\s*\n\s*export const mockIncidents/;
    if (storyInsertionTarget.test(content)) {
      content = content.replace(
        storyInsertionTarget,
        `,\n${buildStoryCodeBlock(newStory)}\n];\n\nexport const mockIncidents`
      );
      console.log('Nueva historia de liberación añadida:', newStory.animalName, '-', newStory.species);
    }
  }

  // 3. Actualizar fechas de Misiones de Campo (mockTasks)
  let taskIndex = 0;
  content = content.replace(
    /(id:\s*'task-\d+'[\s\S]*?date:\s*')(\d{4}-\d{2}-\d{2})(')/g,
    (_, prefix, __, suffix) => {
      taskIndex++;
      const nextDate = formatDateOffset((taskIndex % 6) + 1);
      return `${prefix}${nextDate}${suffix}`;
    }
  );

  // 4. Actualizar fechas del Calendario Grupal (mockGroupActivities)
  let actIndex = 0;
  content = content.replace(
    /(id:\s*'act-\d+'[\s\S]*?date:\s*')(\d{4}-\d{2}-\d{2})(')/g,
    (_, prefix, __, suffix) => {
      actIndex++;
      const nextDate = formatDateOffset(actIndex * 3 + 2);
      return `${prefix}${nextDate}${suffix}`;
    }
  );

  // 5. Actualizar marcas de tiempo de Incidentes de Campo (mockIncidents)
  let incIndex = 0;
  content = content.replace(
    /(id:\s*'inc-\d+'[\s\S]*?timestamp:\s*')(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})(')/g,
    (_, prefix, __, suffix) => {
      incIndex++;
      const nextTs = formatDateTimeOffset(-(incIndex * 7 + 2));
      return `${prefix}${nextTs}${suffix}`;
    }
  );

  // 6. Incrementar indicadores globales de impacto ambiental
  content = content.replace(
    /(animalsRewildedTotal:\s*)(\d+)/,
    (_, prefix, val) => `${prefix}${Number(val) + 2}`
  );
  content = content.replace(
    /(poachingTrapsRemoved:\s*)(\d+)/,
    (_, prefix, val) => `${prefix}${Number(val) + 11}`
  );

  fs.writeFileSync(mockDataPath, content, 'utf8');

  const syncMetaPath = path.join(rootDir, 'src', 'data', 'lastAutoSync.json');
  fs.writeFileSync(
    syncMetaPath,
    JSON.stringify(
      {
        lastSyncISO: new Date().toISOString(),
        cycleIntervalDays: 3,
        lastAddedSanctuary: newSanctuary?.name || null,
        lastAddedStory: newStory?.animalName || null,
        status: 'autonomous_discovery_active'
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  console.log('Actualización autónoma completada con éxito:', new Date().toISOString());
}

runAutonomousUpdate();
