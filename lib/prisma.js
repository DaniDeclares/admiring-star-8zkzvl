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


function installTaggedRawCompat(client) {
  const compile = (strings, values) => {
    if (!Array.isArray(strings) || !Object.prototype.hasOwnProperty.call(strings, 'raw')) {
      throw new TypeError('Tagged raw query must be invoked as a template literal.');
    }
    let sql = '';
    for (let i = 0; i < strings.length; i += 1) {
      sql += strings[i];
      if (i < values.length) sql += `${i + 1}`;
    }
    return { sql, values };
  };

  if (typeof client.$queryRaw !== 'function' && typeof client.$queryRawUnsafe === 'function') {
    Object.defineProperty(client, '$queryRaw', {
      configurable: true,
      value: (strings, ...values) => {
        const compiled = compile(strings, values);
        return client.$queryRawUnsafe(compiled.sql, ...compiled.values);
      },
    });
  }

  if (typeof client.$executeRaw !== 'function' && typeof client.$executeRawUnsafe === 'function') {
    Object.defineProperty(client, '$executeRaw', {
      configurable: true,
      value: (strings, ...values) => {
        const compiled = compile(strings, values);
        return client.$executeRawUnsafe(compiled.sql, ...compiled.values);
      },
    });
  }

  return client;
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

prisma = installTaggedRawCompat(prisma);

export default prisma;
