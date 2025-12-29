FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
