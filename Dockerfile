# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev dependencies needed for build)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build both the React frontend and the Express backend
RUN npm run build


# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install ONLY production dependencies to keep the image lightweight
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the Express server uses
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
