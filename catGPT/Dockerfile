# Use Node.js 20 as the base image (more secure)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variable for Ollama API
ENV VITE_OLLAMA_API_URL=http://localhost:11434

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
