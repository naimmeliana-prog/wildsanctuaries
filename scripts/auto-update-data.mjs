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

let content = fs.readFileSync(mockDataPath, 'utf8');

// 1. Actualizar fechas de Misiones de Campo (mockTasks) para que siempre estén vigentes en los próximos días
let taskIndex = 0;
content = content.replace(
  /(id:\s*'task-\d+'[\s\S]*?date:\s*')(\d{4}-\d{2}-\d{2})(')/g,
  (match, prefix, oldDate, suffix) => {
    taskIndex++;
    const nextDate = formatDateOffset((taskIndex % 6) + 1);
    return `${prefix}${nextDate}${suffix}`;
  }
);

// 2. Actualizar fechas del Calendario Grupal (mockGroupActivities)
let actIndex = 0;
content = content.replace(
  /(id:\s*'act-\d+'[\s\S]*?date:\s*')(\d{4}-\d{2}-\d{2})(')/g,
  (match, prefix, oldDate, suffix) => {
    actIndex++;
    const nextDate = formatDateOffset((actIndex * 3) + 2);
    return `${prefix}${nextDate}${suffix}`;
  }
);

// 3. Actualizar marcas de tiempo de Incidentes de Campo (mockIncidents)
let incIndex = 0;
content = content.replace(
  /(id:\s*'inc-\d+'[\s\S]*?timestamp:\s*')(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})(')/g,
  (match, prefix, oldTs, suffix) => {
    incIndex++;
    const nextTs = formatDateTimeOffset(-(incIndex * 7 + 2));
    return `${prefix}${nextTs}${suffix}`;
  }
);

// 4. Incrementar progresivamente indicadores acumulativos de conservación en mockEnvironmentalStats
content = content.replace(
  /(animalsRewildedTotal:\s*)(\d+)/,
  (_, prefix, val) => `${prefix}${Number(val) + 2}`
);
content = content.replace(
  /(poachingTrapsRemoved:\s*)(\d+)/,
  (_, prefix, val) => `${prefix}${Number(val) + 11}`
);

fs.writeFileSync(mockDataPath, content, 'utf8');

// Guardar registro de última sincronización automática
const syncMetaPath = path.join(rootDir, 'src', 'data', 'lastAutoSync.json');
fs.writeFileSync(
  syncMetaPath,
  JSON.stringify(
    {
      lastSyncISO: new Date().toISOString(),
      cycleIntervalDays: 3,
      status: 'autonomous_active'
    },
    null,
    2
  ) + '\n',
  'utf8'
);

console.log('Actualización autónoma completada con éxito:', new Date().toISOString());
