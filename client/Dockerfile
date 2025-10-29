FROM node:20-alpine

WORKDIR /app

# Copy dependency files (cached layer)
COPY package.json ./

RUN npm install

# Copy source code
COPY . .

# Build argument for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js application
# Next.js will embed NEXT_PUBLIC_* env vars during build
RUN npm run build

# Start Next.js production server
CMD ["npm", "start"]
