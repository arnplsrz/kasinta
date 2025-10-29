FROM node:20-alpine

WORKDIR /app

RUN mkdir -p /uploads/profiles

COPY package.json ./

RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma

RUN npm run prisma:generate

# Copy source code
COPY . .

RUN npm run build
