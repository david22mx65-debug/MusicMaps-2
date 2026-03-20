
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'MusicMapsAudioDB';
const STORE_NAME = 'audioFiles';
const DB_VERSION = 1;

export interface AudioFileData {
  id: string;
  file: File | Blob;
  name: string;
  type: string;
}

class AudioStorageService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async saveAudio(id: string, file: File | Blob, name: string, type: string): Promise<void> {
    const db = await this.db;
    await db.put(STORE_NAME, { id, file, name, type });
  }

  async getAudio(id: string): Promise<AudioFileData | undefined> {
    const db = await this.db;
    return db.get(STORE_NAME, id);
  }

  async deleteAudio(id: string): Promise<void> {
    const db = await this.db;
    await db.delete(STORE_NAME, id);
  }

  async getAllIds(): Promise<string[]> {
    const db = await this.db;
    return db.getAllKeys(STORE_NAME) as Promise<string[]>;
  }

  async clear(): Promise<void> {
    const db = await this.db;
    await db.clear(STORE_NAME);
  }
}

export const audioStorage = new AudioStorageService();
