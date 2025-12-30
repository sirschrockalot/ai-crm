# Google Cloud Storage File Storage Implementation

## Overview

This document describes the implementation of Google Cloud Storage (GCS) for storing documents in the Leads and Transactions services. This replaces the previous local file storage approach with a more scalable, cost-effective solution.

## Benefits

- **Cost-Effective**: Pay only for storage and operations used
- **Scalable**: Handles large files and high volumes without performance issues
- **Durable**: 99.999999999% (11 9's) durability
- **Secure**: Signed URLs for secure access without exposing bucket publicly
- **Production-Ready**: Works seamlessly in GCP environments

## Architecture

### Storage Service Module

A reusable `StorageService` module has been created in both services:
- `transactions-service/src/storage/storage.service.ts`
- `Leads-Service/src/storage/storage.service.ts`

The service handles:
- File uploads to GCS
- File deletion from GCS
- Signed URL generation for secure access
- Fallback to local storage for development (when `USE_GCS=false`)

### File Upload Flow

1. Client uploads file via multipart/form-data
2. Multer (with memory storage) receives file buffer
3. StorageService uploads buffer to GCS bucket
4. GCS returns signed URL (valid for 1 year by default)
5. Document metadata (name, URL, size, mimeType, fileName) stored in MongoDB
6. Signed URL returned to client for file access

### File Deletion Flow

1. Client requests document deletion
2. Service retrieves document from MongoDB
3. StorageService deletes file from GCS using stored `fileName`
4. Document metadata removed from MongoDB

## Configuration

### Environment Variables

Add these to your `.env` files:

```bash
# Google Cloud Storage Configuration
USE_GCS=true
GCS_BUCKET_NAME=presidential-digs-crm-documents
GCS_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GCS_SIGNED_URL_EXPIRATION=31536000000  # 1 year in milliseconds
```

### GCS Bucket Setup

1. **Create GCS Bucket**:
   ```bash
   gsutil mb -p your-project-id gs://presidential-digs-crm-documents
   ```

2. **Create Service Account**:
   - Go to GCP Console → IAM & Admin → Service Accounts
   - Create new service account with "Storage Admin" role
   - Download JSON key file

3. **Set Permissions**:
   - Ensure service account has `storage.objects.create`, `storage.objects.delete`, and `storage.objects.get` permissions

### Local Development

For local development, you can disable GCS:

```bash
USE_GCS=false
```

This will use local file storage as a fallback. Note that in production, GCS should always be enabled.

## API Endpoints

### Transactions Service

- `POST /api/v1/transactions/:id/documents` - Upload document
- `DELETE /api/v1/transactions/:id/documents/:documentId` - Delete document

### Leads Service

- `POST /api/v1/leads/:id/documents` - Upload document
- `DELETE /api/v1/leads/:id/documents/:documentId` - Delete document

## File Structure

Files are organized in GCS by folder:
- `transactions/{uuid}.{ext}` - Transaction documents
- `leads/{uuid}.{ext}` - Lead documents

## Database Schema Updates

### Transaction Schema

Added `fileName` field to `DocumentInfo`:
```typescript
@Prop()
fileName?: string; // GCS file path for deletion
```

### Lead Schema

Added `documents` array to `Lead`:
```typescript
@Prop({ type: [{
  id: String,
  name: String,
  url: String,
  fileName: String,
  uploadedAt: Date,
  uploadedBy: String,
  fileSize: Number,
  mimeType: String,
}], default: [] })
documents?: Array<{...}>;
```

## Migration from Local Storage

If you have existing files in local storage:

1. Files are stored with signed URLs in MongoDB
2. Old local files can remain for backward compatibility
3. New uploads automatically go to GCS
4. Consider running a migration script to upload existing files to GCS

## Cost Considerations

### GCS Pricing (approximate)

- **Storage**: ~$0.020 per GB/month (Standard storage)
- **Operations**: 
  - Class A (uploads): $0.05 per 10,000 operations
  - Class B (downloads): $0.004 per 10,000 operations
- **Network Egress**: First 1GB/month free, then $0.12/GB

### Cost Optimization Tips

1. Use **Nearline** or **Coldline** storage classes for archived documents
2. Set up **Lifecycle policies** to automatically move old files to cheaper storage
3. Use **Signed URLs** instead of making buckets public (more secure and cost-effective)
4. Consider **Cloud CDN** for frequently accessed files

## Security

- Files are **not publicly accessible** by default
- **Signed URLs** provide time-limited access (1 year default)
- Service account credentials should be stored securely (use GCP Secret Manager in production)
- File access is controlled through application authentication

## Troubleshooting

### Common Issues

1. **"GCS Storage initialization failed"**
   - Check `GOOGLE_APPLICATION_CREDENTIALS` path
   - Verify service account has correct permissions
   - Ensure bucket exists

2. **"File upload failed"**
   - Check bucket permissions
   - Verify file size limits (10MB default)
   - Check network connectivity

3. **"Signed URL expired"**
   - Default expiration is 1 year
   - Regenerate URL using `getSignedUrl()` method
   - Consider increasing `GCS_SIGNED_URL_EXPIRATION`

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

Storage service logs all operations at INFO level.

## Next Steps

1. **Install dependencies**: Run `npm install` in both services
2. **Set up GCS bucket**: Create bucket and service account
3. **Configure environment**: Add GCS environment variables
4. **Test upload**: Upload a test document via API
5. **Monitor costs**: Set up GCP billing alerts

## References

- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [@google-cloud/storage npm package](https://www.npmjs.com/package/@google-cloud/storage)
- [GCS Pricing](https://cloud.google.com/storage/pricing)

