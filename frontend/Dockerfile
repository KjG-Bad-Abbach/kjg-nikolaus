# Use Node.js LTS version
FROM node:22.22.0-slim

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Expose port (if you're using browser-sync)
EXPOSE 3000 3001

# Command to run the development server
CMD ["pnpm", "run", "dev"]
