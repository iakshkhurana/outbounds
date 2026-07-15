FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY .env.example ./

RUN npx prisma generate

ENV PORT=4000
ENV DATABASE_URL="file:/data/dev.db"
ENV SNIFFER_SHARED_TOKEN=dev-local-token
ENV ALLOW_DEMO_REPLAY=true
ENV CORS_ORIGIN=http://localhost:3000
ENV SAMPLE_DATA_PATH=/sample-data/events.jsonl

EXPOSE 4000

CMD ["sh", "-c", "mkdir -p /data && npx prisma db push && npx tsx src/index.ts"]
