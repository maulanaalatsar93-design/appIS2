import { PrismaClient } from '@prisma/client';

const rawUrl = process.env.DATABASE_URL || "postgresql://postgres.wthtnimlkdhnvkhnyssl:719394Malang@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=15&pool_timeout=0";

let formattedUrl = rawUrl;
if (formattedUrl.includes(':5432')) {
  formattedUrl = formattedUrl.replace(':5432', ':6543');
}
if (!formattedUrl.includes('pool_timeout')) {
  formattedUrl += (formattedUrl.includes('?') ? '&' : '?') + 'pool_timeout=0';
}
if (!formattedUrl.includes('pgbouncer')) {
  formattedUrl += '&pgbouncer=true';
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: formattedUrl,
    },
  },
});

export default prisma;
