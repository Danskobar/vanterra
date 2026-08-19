import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', '..', 'data', 'db.json');

const defaultData = {
  // linkCode -> { walletAddress, createdAt, telegramChatId, telegramUsername, status }
  linkCodes: {},
  // walletAddress -> { telegramChatId, telegramUsername, linkedAt }
  walletLinks: {},
  // telegramChatId -> walletAddress
  chatLinks: {},
};

const adapter = new JSONFile(file);
export const db = new Low(adapter, structuredClone(defaultData));

export async function initDb() {
  await db.read();
  db.data ||= structuredClone(defaultData);
  await db.write();
}
