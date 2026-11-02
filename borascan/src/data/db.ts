// IndexedDB data storage using `idb` for offline persistence of tests, batches, and user preferences

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { BatchCalibration, DEMO_BATCH } from '../core/config.ts';
import { PipelineResult } from '../core/pipeline.ts';

export interface TestRecord {
  id: string; // ISO string timestamp or uuid
  date: string; // ISO timestamp
  foodType: string;
  note?: string;
  batchId: string;
  category: '0' | '1' | '2' | 'B+' | 'B-';
  isAmmoniaDone: boolean;
  estimate: {
    xPct: number;
    mgPerKg: number;
    rangeLoPct: number;
    rangeHiPct: number;
    displayTextPct: string;
    displayTextMgKg: string;
  };
  initialPhotoDataUrl?: string;
  ammoniaPhotoDataUrl?: string;
  initialPipelineResult?: PipelineResult;
  ammoniaPipelineResult?: PipelineResult;
}

export interface UserSettings {
  lang: 'id' | 'en';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  largeText: boolean;
  highContrast: boolean;
  defaultReporterName: string;
  researchMode: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  lang: 'id',
  soundEnabled: true,
  vibrationEnabled: true,
  largeText: false,
  highContrast: false,
  defaultReporterName: '',
  researchMode: false,
};

interface BoraScanDBSchema extends DBSchema {
  tests: {
    key: string;
    value: TestRecord;
    indexes: { 'by-date': string; 'by-category': string };
  };
  batches: {
    key: string; // batch name e.g. "BN-2611-01"
    value: BatchCalibration & { isActive: boolean };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'borascan_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BoraScanDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<BoraScanDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<BoraScanDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tests')) {
          const testStore = db.createObjectStore('tests', { keyPath: 'id' });
          testStore.createIndex('by-date', 'date');
          testStore.createIndex('by-category', 'category');
        }
        if (!db.objectStoreNames.contains('batches')) {
          db.createObjectStore('batches', { keyPath: 'batch' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// Tests Operations
export async function saveTest(test: TestRecord): Promise<void> {
  const db = await getDB();
  await db.put('tests', test);
}

export async function getAllTests(): Promise<TestRecord[]> {
  const db = await getDB();
  const list = await db.getAllFromIndex('tests', 'by-date');
  return list.reverse(); // Newest first
}

export async function getTestById(id: string): Promise<TestRecord | undefined> {
  const db = await getDB();
  return db.get('tests', id);
}

export async function deleteTestById(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tests', id);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('tests');
  await db.clear('batches');
  await db.clear('settings');
  // Re-seed demo batch and default settings
  await saveBatch({ ...DEMO_BATCH, isActive: true });
  await saveSettings(DEFAULT_SETTINGS);
}

// Batches Operations
export async function getBatches(): Promise<Array<BatchCalibration & { isActive: boolean }>> {
  const db = await getDB();
  let batches = await db.getAll('batches');
  if (batches.length === 0) {
    const initialBatch = { ...DEMO_BATCH, isActive: true };
    await db.put('batches', initialBatch);
    batches = [initialBatch];
  }
  return batches;
}

export async function getActiveBatch(): Promise<BatchCalibration> {
  const batches = await getBatches();
  const active = batches.find((b) => b.isActive) || batches[0] || DEMO_BATCH;
  return active;
}

export async function setActiveBatch(batchName: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('batches', 'readwrite');
  const store = tx.objectStore('batches');
  const all = await store.getAll();
  for (const b of all) {
    b.isActive = b.batch === batchName;
    await store.put(b);
  }
  await tx.done;
}

export async function saveBatch(batch: BatchCalibration & { isActive?: boolean }): Promise<void> {
  const db = await getDB();
  await db.put('batches', { ...batch, isActive: batch.isActive ?? false });
}

// Settings Operations
export async function getSettings(): Promise<UserSettings> {
  try {
    const db = await getDB();
    const stored = await db.get('settings', 'user_settings');
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'user_settings');
}
