import { PrismaClient } from '@prisma/client';

function productionDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;

  // Supabase's transaction pooler (Supavisor) does not support Prisma's
  // named prepared statements. Disable Prisma's statement cache when the
  // production connection is pooler-backed so serverless invocations cannot
  // collide on prepared statement names (42P05 / P2010).
  try {
    const url = new URL(raw);
    if (url.searchParams.get('pgbouncer') !== 'true') {
      url.searchParams.set('pgbouncer', 'true');
    }
    return url.toString();
  } catch {
    return raw;
  }
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: { url: productionDatabaseUrl() },
    },
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
