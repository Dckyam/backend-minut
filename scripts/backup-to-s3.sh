#!/bin/bash

# Automated Database Backup to S3
# This script backs up PostgreSQL database and uploads to S3 Neo Object Storage

set -e

# Environment variables are already loaded from Docker
# No need to source .env file

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/db-backups"
BACKUP_FILENAME="${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILENAME}"
S3_FOLDER="${SITE_NAME}-backup-db"

# Create backup directory
mkdir -p ${BACKUP_DIR}

echo "[$(date)] Starting database backup..."
echo "Database: ${DB_NAME}"
echo "S3 Bucket: ${S3_BUCKET}/${S3_FOLDER}"

# Backup database using pg_dump
export PGPASSWORD="${DB_PASSWORD}"
pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "[$(date)] ✓ Database backup created: ${BACKUP_FILE}"

    # Get file size
    FILE_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
    echo "[$(date)] Backup size: ${FILE_SIZE}"

    # Compress backup
    gzip ${BACKUP_FILE}
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h ${COMPRESSED_FILE} | cut -f1)
    echo "[$(date)] ✓ Compressed: ${COMPRESSED_SIZE}"

    # Upload to S3 using AWS CLI
    echo "[$(date)] Uploading to S3..."

    AWS_ACCESS_KEY_ID=${S3_ACCESS_KEY} \
    AWS_SECRET_ACCESS_KEY=${S3_SECRET_KEY} \
    aws s3 cp ${COMPRESSED_FILE} \
        s3://${S3_BUCKET}/${S3_FOLDER}/${BACKUP_FILENAME}.gz \
        --endpoint-url ${S3_ENDPOINT} \
        --region ${S3_REGION}

    if [ $? -eq 0 ]; then
        echo "[$(date)] ✓ Upload successful: s3://${S3_BUCKET}/${S3_FOLDER}/${BACKUP_FILENAME}.gz"

        # Clean up local backup
        rm -f ${COMPRESSED_FILE}
        echo "[$(date)] ✓ Local backup cleaned up"

        # Keep only last 7 days of backups in S3
        echo "[$(date)] Cleaning old backups (keeping last 7 days)..."

        # Calculate cutoff date (7 days ago) - Alpine Linux compatible
        CUTOFF_TIMESTAMP=$(($(date +%s) - 7*24*60*60))
        CUTOFF_DATE=$(date -d @${CUTOFF_TIMESTAMP} +%Y%m%d 2>/dev/null || date -r ${CUTOFF_TIMESTAMP} +%Y%m%d)

        AWS_ACCESS_KEY_ID=${S3_ACCESS_KEY} \
        AWS_SECRET_ACCESS_KEY=${S3_SECRET_KEY} \
        aws s3 ls s3://${S3_BUCKET}/${S3_FOLDER}/ \
            --endpoint-url ${S3_ENDPOINT} \
            --region ${S3_REGION} | while read -r line; do

            file=$(echo $line | awk '{print $4}')
            if [[ $file =~ ${DB_NAME}_([0-9]{8})_ ]]; then
                file_date="${BASH_REMATCH[1]}"
                if [ "$file_date" -lt "$CUTOFF_DATE" ]; then
                    echo "[$(date)] Deleting old backup: $file"
                    AWS_ACCESS_KEY_ID=${S3_ACCESS_KEY} \
                    AWS_SECRET_ACCESS_KEY=${S3_SECRET_KEY} \
                    aws s3 rm s3://${S3_BUCKET}/${S3_FOLDER}/$file \
                        --endpoint-url ${S3_ENDPOINT} \
                        --region ${S3_REGION}
                fi
            fi
        done

        echo "[$(date)] ✓ Backup completed successfully!"
    else
        echo "[$(date)] ✗ Upload failed"
        exit 1
    fi
else
    echo "[$(date)] ✗ Database backup failed"
    exit 1
fi
