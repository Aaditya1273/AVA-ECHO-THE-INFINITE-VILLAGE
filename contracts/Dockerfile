# Docker image for smart contract development and deployment
FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy contract source code
COPY . .

# Compile contracts
RUN npm run compile

# Expose port for local development
EXPOSE 8545

# Default command
CMD ["npm", "run", "node"]
