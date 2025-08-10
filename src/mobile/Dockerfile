# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose ports for Expo
EXPOSE 19000 19001 19002

# Start Expo development server
CMD ["npx", "expo", "start", "--dev-client", "--host", "localhost"]
