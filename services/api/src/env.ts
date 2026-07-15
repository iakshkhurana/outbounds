export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
  snifferToken: process.env.SNIFFER_SHARED_TOKEN ?? 'dev-local-token',
  allowDemoReplay: (process.env.ALLOW_DEMO_REPLAY ?? 'false').toLowerCase() === 'true',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
}
