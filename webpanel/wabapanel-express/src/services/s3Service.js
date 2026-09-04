const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');
const uuidv4 = () => randomUUID();
const path = require('path');
const fs = require('fs');

class S3Service {
  constructor(config = {}) {
    this.bucket = config.bucket || process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
    this.region = config.region || process.env.AWS_REGION || 'ap-south-1';
    this.client = null;
  }

  _getClient(config = {}) {
    if (this.client) return this.client;
    this.client = new S3Client({
      region: config.region || this.region,
      credentials: {
        accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    return this.client;
  }

  resetClient() {
    this.client = null;
  }

  initFromSettings(settings) {
    const s3Config = settings?.aws || settings?.s3 || {};
    this.bucket = s3Config.bucket || process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME || this.bucket;
    this.region = s3Config.region || this.region;
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: s3Config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    return this;
  }

  async upload(file, folder = 'uploads') {
    // Use local storage if S3 not configured
    if (!this.bucket || !process.env.AWS_ACCESS_KEY_ID) {
      return this._uploadLocal(file, folder);
    }
    const client = this._getClient();
    const ext = path.extname(file.originalname);
    const key = `${folder}/${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await client.send(command);

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { key, url, bucket: this.bucket };
  }

  _uploadLocal(file, folder = 'uploads') {
    const uploadDir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(file.originalname);
    const filename = uuidv4() + ext;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    const url = `/uploads/${folder}/${filename}`;
    return { key: `${folder}/${filename}`, url, bucket: 'local' };
  }

  async uploadBuffer(buffer, filename, mimetype, folder = 'uploads') {
    const client = this._getClient();
    const ext = path.extname(filename);
    const key = `${folder}/${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    await client.send(command);

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { key, url, bucket: this.bucket };
  }

  async delete(key) {
    const client = this._getClient();
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return client.send(command);
  }

  async getSignedDownloadUrl(key, expiresIn = 3600) {
    const client = this._getClient();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(client, command, { expiresIn });
  }

  _resolveBucket() {
    return this.bucket || process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME || null;
  }

  getPublicObjectUrl(key) {
    const bucket = this._resolveBucket();
    if (!bucket || !key) return null;
    return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /** Read object bytes from S3 (theme editor proxy — avoids browser CORS on public S3 URLs). */
  async getObjectBuffer(key) {
    const bucket = this._resolveBucket();
    if (!bucket || !key) {
      const err = new Error('S3 object key is required');
      err.statusCode = 400;
      throw err;
    }
    if (!process.env.AWS_ACCESS_KEY_ID) {
      const err = new Error('AWS S3 is not configured on the server');
      err.statusCode = 503;
      throw err;
    }
    const client = this._getClient();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await client.send(command);
    if (!response.Body) {
      const err = new Error('S3 object not found');
      err.statusCode = 404;
      throw err;
    }
    const bytes = await response.Body.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      contentType: response.ContentType || 'application/octet-stream',
    };
  }

  /** Read a UTF-8 text object from S3 (e.g. index.html for theme preview). */
  async readUtf8Object(key) {
    const bucket = this._resolveBucket();
    if (!bucket || !process.env.AWS_ACCESS_KEY_ID || !key) return null;
    const client = this._getClient();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await client.send(command);
    if (!response.Body) return null;
    return response.Body.transformToString('utf-8');
  }

  getMeta() {
    return {
      bucket: this.bucket || null,
      region: this.region || null,
    };
  }

  isConfigured() {
    return Boolean(this._resolveBucket() && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }

  /**
   * Presigned PUT URL for direct browser → S3 upload (Codiic-style).
   */
  async generateUploadSignedUrl({
    fileName,
    fileType,
    folder = 'uploads/images',
    expiresInSeconds = 900,
  }) {
    if (!this.bucket || !process.env.AWS_ACCESS_KEY_ID) {
      const err = new Error('AWS S3 is not configured on the server');
      err.statusCode = 503;
      throw err;
    }

    const client = this._getClient();
    const safeExpires = Math.min(Math.max(Number(expiresInSeconds) || 900, 60), 3600);
    const parsedFolder = String(folder || 'uploads/images').replace(/^\/+|\/+$/g, '');
    const ext = path.extname(fileName) || '';
    const baseName =
      path
        .basename(fileName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'image';
    const key = `${parsedFolder}/${Date.now()}-${uuidv4()}-${baseName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn: safeExpires });
    const url = this.getPublicObjectUrl(key);

    return {
      signedUrl,
      key,
      bucket: this.bucket,
      region: this.region,
      method: 'PUT',
      contentType: fileType,
      expiresInSeconds: safeExpires,
      objectUrl: url,
    };
  }

  async deleteObjects(keys = []) {
    if (!keys.length) return { deletedKeys: [], deletedCount: 0 };
    if (!this.bucket || !process.env.AWS_ACCESS_KEY_ID) {
      return { deletedKeys: [], deletedCount: 0 };
    }
    const client = this._getClient();
    const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');
    const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
    const deleteResult = await client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: uniqueKeys.map((Key) => ({ Key })),
          Quiet: false,
        },
      })
    );
    const deletedKeys = (deleteResult.Deleted || []).map((item) => item.Key).filter(Boolean);
    const failed = deleteResult.Errors || [];
    if (failed.length) {
      const details = failed
        .map((item) => `${item.Key || 'unknown'} [${item.Code || 'ERR'}: ${item.message || item.Message}]`)
        .join(', ');
      const err = new Error(`Failed to delete one or more S3 objects: ${details}`);
      err.statusCode = 500;
      throw err;
    }
    return { deletedKeys, deletedCount: deletedKeys.length };
  }
}

module.exports = new S3Service();
