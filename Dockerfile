# Step 1: Install dependencies and build the app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Set build-time environment variable
ARG NEXT_PUBLIC_API_URL=https://wellness-360-server.onrender.com
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the app
RUN npm run build

# Step 2: Use a lighter image to serve the built app
FROM node:18-alpine AS runner

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL=https://wellness-360-server.onrender.com
ENV PORT 3000

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]
