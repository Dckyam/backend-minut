FROM node:18-alpine

WORKDIR /app

# Install system dependencies (postgresql-client, aws-cli, cron, timezone)
RUN apk add --no-cache \
    postgresql-client \
    aws-cli \
    dcron \
    bash \
    tzdata

# Set timezone to Asia/Jakarta (WIB)
ENV TZ=Asia/Jakarta
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application files
COPY . .

# Create scripts directory and copy backup script
RUN mkdir -p /app/scripts
COPY scripts/backup-to-s3.sh /app/scripts/
RUN chmod +x /app/scripts/backup-to-s3.sh

# Setup cron job (daily backup at 11:50 AM for testing)
RUN echo "50 11 * * * /app/scripts/backup-to-s3.sh >> /var/log/backup.log 2>&1" > /etc/crontabs/root

# Create log file
RUN touch /var/log/backup.log

# Expose port
EXPOSE 3000

# Start cron and application
CMD crond && npm start
