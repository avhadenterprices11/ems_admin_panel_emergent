import * as dotenv from 'dotenv';
dotenv.config();

// Determine SSL configuration based on environment
const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DATABASE_SSL === 'true';
const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';

// SSL config for AWS RDS
const sslConfig = useSSL ? {
  ssl: {
    rejectUnauthorized: rejectUnauthorized,
  },
} : {};

const config = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'event_management',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    ...sslConfig,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
};

export default config;
