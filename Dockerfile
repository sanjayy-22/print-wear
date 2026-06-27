# Use Node.js base image
FROM node:20-slim

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Move assets to public directory for the production build
RUN mkdir -p public && mv assets public/assets || true

# Build the Vite frontend and compile server.ts
RUN npm run build

# Hugging Face Spaces requires the container to listen on port 7860
EXPOSE 7860
ENV PORT=7860

# Run the Express backend
CMD ["node", "dist/server.cjs"]
