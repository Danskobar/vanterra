import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'db.json');

const defaultData = {
  linkCodes: {},
  walletLinks: {},
  chatLinks: {},
};

const adapter = new JSONFile(file);
export const db = new Low(adapter, structuredClone(defaultData));

export async function initDb() {
  await mkdir(dataDir, { recursive: true });
  await db.read();
  db.data ||= structuredClone(defaultData);
  await db.write();
}