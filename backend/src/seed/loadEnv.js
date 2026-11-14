// Loads backend/.env.local, then backend/.env, for plain-Node scripts (Next.js does this
// itself for the server). Values already set in the shell are never overridden.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
dotenv.config({ path: path.join(backendRoot, '.env.local'), quiet: true });
dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true });
