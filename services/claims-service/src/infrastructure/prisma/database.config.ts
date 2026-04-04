import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'backend/.env'),
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../../.env'),
];

let envLoaded = false;

for (const envPath of envPaths) {
  if (!existsSync(envPath)) {
    continue;
  }

  dotenv.config({ path: envPath });
  envLoaded = true;
  break;
}

if (!envLoaded) {
  dotenv.config();
}

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
    throw new Error(
      'DATABASE_URL no esta configurada. Crea backend/.env con la conexion a PostgreSQL antes de iniciar Prisma o ejecutar el seeder.',
    );
  }

  return databaseUrl;
}