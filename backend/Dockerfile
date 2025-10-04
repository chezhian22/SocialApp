# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create directory for uploaded images
RUN mkdir -p Post_images

# Expose port
EXPOSE 5001

# Start the application
CMD ["node", "server.js"]
