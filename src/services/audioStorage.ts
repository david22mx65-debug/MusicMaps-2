
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'MusicMapsAudioDB';
const STORE_NAME = 'audioFiles';
const MOTION_STORE_NAME = 'motionPlaylist'; 
const LIBRARY_STORE_NAME = 'musicLibrary'; // New store for general library
const DB_VERSION = 3; // Increment version for new store

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
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(MOTION_STORE_NAME)) {
          db.createObjectStore(MOTION_STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(LIBRARY_STORE_NAME)) {
          db.createObjectStore(LIBRARY_STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  // Zone Audio
  async saveAudio(id: string, file: File | Blob, name: string, type: string): Promise<void> {
    const db = await this.db;
    await db.put(STORE_NAME, { id, file, name, type });
    // Also save to library for future use
    await db.put(LIBRARY_STORE_NAME, { id, file, name, type });
  }

  async getAudio(id: string): Promise<AudioFileData | undefined> {
    const db = await this.db;
    return db.get(STORE_NAME, id);
  }

  async deleteAudio(id: string): Promise<void> {
    const db = await this.db;
    await db.delete(STORE_NAME, id);
  }

  // Motion Audio
  async saveMotionAudio(id: string, file: File | Blob, name: string, type: string): Promise<void> {
    const db = await this.db;
    await db.put(MOTION_STORE_NAME, { id, file, name, type });
    // Also save to library
    await db.put(LIBRARY_STORE_NAME, { id, file, name, type });
  }

  async getMotionAudio(id: string): Promise<AudioFileData | undefined> {
    const db = await this.db;
    return db.get(MOTION_STORE_NAME, id);
  }

  async deleteMotionAudio(id: string): Promise<void> {
    const db = await this.db;
    await db.delete(MOTION_STORE_NAME, id);
  }

  async getAllMotionAudio(): Promise<AudioFileData[]> {
    const db = await this.db;
    return db.getAll(MOTION_STORE_NAME);
  }

  // Library
  async saveToLibrary(id: string, file: File | Blob, name: string, type: string): Promise<void> {
    const db = await this.db;
    await db.put(LIBRARY_STORE_NAME, { id, file, name, type });
  }

  async getAllLibraryAudio(): Promise<AudioFileData[]> {
    const db = await this.db;
    return db.getAll(LIBRARY_STORE_NAME);
  }

  async deleteFromLibrary(id: string): Promise<void> {
    const db = await this.db;
    await db.delete(LIBRARY_STORE_NAME, id);
  }

  async getAllIds(): Promise<string[]> {
    const db = await this.db;
    return db.getAllKeys(STORE_NAME) as Promise<string[]>;
  }

  async clear(): Promise<void> {
    const db = await this.db;
    await db.clear(STORE_NAME);
    await db.clear(MOTION_STORE_NAME);
  }
}

export const audioStorage = new AudioStorageService();
