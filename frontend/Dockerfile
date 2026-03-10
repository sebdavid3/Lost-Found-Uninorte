FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the project (Vite)
RUN npm run build

# Start a lightweight web server (e.g. nginx or serve)
FROM node:20-alpine
WORKDIR /app

# Install 'serve'
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5173

# Run serve on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
