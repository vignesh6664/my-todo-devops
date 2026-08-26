# Builder Stage

FROM node:18-bullseye-slim AS builder

WORKDIR /app

COPY package*.json /

RUN npm install --include=dev

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build


# Runner Stage (Light weight image)

FROM node:18-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*json ./

RUN npm install --omit=dev

COPY prisma ./prisma

RUN npx prisma generate 

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 8080

CMD ["npm", "start"]

