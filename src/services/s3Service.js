const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config/config');

class S3Service {
  constructor() {
    // Initialize S3 client with Neo Object Storage credentials
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'https://nos.wjv-1.neo.id',
      region: 'wjv-1', // Neo Object Storage region
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '1199ee2ab0f3604f0101',
        secretAccessKey: process.env.S3_SECRET_KEY || 'swrEWgIOi6pug3FxGED9yIdwCaK4Gh4AeDxU8+NT'
      },
      forcePathStyle: true, // Required for Neo Object Storage
    });

    this.bucketName = process.env.S3_BUCKET || 'smhg-extensions-doc';
    this.siteName = process.env.SITE_NAME || 'general';
  }

  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {string} fileName - File name with extension
   * @param {string} contentType - MIME type of file
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Upload result with S3 key and URL
   */
  async uploadFile(fileBuffer, fileName, contentType, metadata = {}) {
    try {
      // Generate unique key: {site_name}/{no_claim}/{timestamp}_{filename}
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = metadata.no_claim
        ? `${this.siteName}/${metadata.no_claim}/${timestamp}_${sanitizedFileName}`
        : `${this.siteName}/general/${timestamp}_${sanitizedFileName}`;

      console.log('📤 Uploading file to S3:', {
        bucket: this.bucketName,
        key: s3Key,
        size: fileBuffer.length,
        contentType: contentType
      });

      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: {
          'no-registrasi': metadata.no_registrasi || '',
          'no-mr': metadata.no_mr || '',
          'no-kartu': metadata.no_kartu || '',
          'no-claim': metadata.no_claim || '',
          'doc-type': metadata.doc_type || '',
          'uploaded-by': metadata.uploaded_by || '',
          'original-filename': fileName
        }
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      console.log('✅ File uploaded successfully to S3');

      return {
        success: true,
        s3Key: s3Key,
        bucket: this.bucketName,
        url: `${process.env.S3_ENDPOINT}/${this.bucketName}/${s3Key}`,
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('❌ S3 Upload Error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Download file from S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<Object>} File stream and metadata
   */
  async downloadFile(s3Key) {
    try {
      console.log('📥 Downloading file from S3:', {
        bucket: this.bucketName,
        key: s3Key
      });

      const downloadParams = {
        Bucket: this.bucketName,
        Key: s3Key
      };

      const command = new GetObjectCommand(downloadParams);
      const response = await this.s3Client.send(command);

      console.log('✅ File downloaded successfully from S3');

      return {
        success: true,
        stream: response.Body,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        metadata: response.Metadata
      };
    } catch (error) {
      console.error('❌ S3 Download Error:', error);
      throw new Error(`Failed to download file from S3: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for temporary access
   * @param {string} s3Key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns {Promise<string>} Presigned URL
   */
  async getPresignedUrl(s3Key, expiresIn = 3600) {
    try {
      console.log('🔗 Generating presigned URL:', {
        bucket: this.bucketName,
        key: s3Key,
        expiresIn: expiresIn
      });

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      console.log('✅ Presigned URL generated successfully');

      return presignedUrl;
    } catch (error) {
      console.error('❌ Presigned URL Error:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(s3Key) {
    try {
      console.log('🗑️ Deleting file from S3:', {
        bucket: this.bucketName,
        key: s3Key
      });

      const deleteParams = {
        Bucket: this.bucketName,
        Key: s3Key
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);

      console.log('✅ File deleted successfully from S3');

      return true;
    } catch (error) {
      console.error('❌ S3 Delete Error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Check if file exists in S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(s3Key) {
    try {
      const headParams = {
        Bucket: this.bucketName,
        Key: s3Key
      };

      const command = new HeadObjectCommand(headParams);
      await this.s3Client.send(command);

      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      console.error('❌ S3 Head Object Error:', error);
      throw new Error(`Failed to check file existence: ${error.message}`);
    }
  }

  /**
   * Get file metadata from S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(s3Key) {
    try {
      const headParams = {
        Bucket: this.bucketName,
        Key: s3Key
      };

      const command = new HeadObjectCommand(headParams);
      const response = await this.s3Client.send(command);

      return {
        success: true,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata
      };
    } catch (error) {
      console.error('❌ S3 Metadata Error:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }
}

module.exports = new S3Service();
