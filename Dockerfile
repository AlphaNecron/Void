FROM node:14-alpine3.14 AS builder
WORKDIR /build

ENV NEXT_TELEMETRY_DISABLED=1

COPY src ./src
COPY scripts ./scripts
COPY prisma ./prisma
COPY twilight ./twilight

COPY package.json yarn.lock next.config.js next-env.d.ts void-env.d.ts tsconfig.json .eslintrc.js server.ts ./

RUN yarn install

ENV DATABASE_URL=postgres://postgres:postgres@postgres/postgres

RUN echo -e "[core]\nsecret = 'dockersecret'\n[uploader]\nraw_route = '/r'\ndirectory = './uploads'\n[shortener]\nroute = '/go'" > config.toml

RUN yarn build

FROM node:14-alpine3.14 AS runner
WORKDIR /void

COPY --from=builder /build/node_modules ./node_modules

COPY --from=builder /build/src ./src
COPY --from=builder /build/server.ts ./server.ts
COPY --from=builder /build/scripts ./scripts
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/.next ./.next
COPY --from=builder /build/.eslintrc.js ./.eslintrc.js
COPY --from=builder /build/tsconfig.json ./tsconfig.json
COPY --from=builder /build/package.json ./package.json
COPY --from=builder	/build/twilight	./twilight

CMD ["yarn", "start"]