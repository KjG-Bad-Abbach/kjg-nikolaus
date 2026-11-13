# Use Node.js LTS version
FROM node:22.23.5-slim

# Set working directory
WORKDIR /app

# Install pnpm globally
# renovate: datasource=npm depName=pnpm
ARG PNPM_VERSION=12.9.0
RUN npm install -g pnpm@"${PNPM_VERSION}"

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the Vite development server
EXPOSE 3000

# Command to run the development server
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "3000", "--strictPort"]
