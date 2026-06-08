import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface GenerateImageSignedUrlPayload {
  fileName: string;
  fileType: string;
  folder?: string;
  expiresInSeconds?: number;
}

export interface ImageSignedUrlData {
  signedUrl: string;
  key: string;
  bucket: string;
  region: string;
  method: 'PUT';
  contentType: string;
  expiresInSeconds: number;
  objectUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface UploadImageWithSignedUrlResult {
  objectUrl: string;
  key: string;
}

interface DeleteImagesResult {
  deletedKeys: string[];
  deletedCount: number;
}

interface DeleteImagesPayload {
  imageUrls?: string[];
  imageKeys?: string[];
}

interface AwsUploadContextType {
  loading: boolean;
  error: string | null;
  lastSignedUrlData: ImageSignedUrlData | null;
  generateImageUploadSignedUrl: (
    payload: GenerateImageSignedUrlPayload
  ) => Promise<ImageSignedUrlData>;
  uploadFileToSignedUrl: (
    signedUrl: string,
    file: File,
    contentType: string
  ) => Promise<void>;
  uploadImageWithSignedUrl: (
    file: File,
    options?: { folder?: string; expiresInSeconds?: number }
  ) => Promise<UploadImageWithSignedUrlResult>;
  deleteImagesFromS3: (payload: DeleteImagesPayload) => Promise<DeleteImagesResult>;
  clearError: () => void;
}

const AwsUploadContext = createContext<AwsUploadContextType | undefined>(undefined);

export const AwsUploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSignedUrlData, setLastSignedUrlData] = useState<ImageSignedUrlData | null>(null);

  const generateImageUploadSignedUrl = useCallback(
    async (payload: GenerateImageSignedUrlPayload): Promise<ImageSignedUrlData> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.post<ApiResponse<ImageSignedUrlData>>(
          '/aws/signed-url/image',
          payload
        );
        const { success, data, message } = res.data;
        if (!success || !data) {
          throw new Error(message || 'Failed to generate signed URL');
        }
        setLastSignedUrlData(data);
        return data;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to generate signed URL';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadFileToSignedUrl = useCallback(
    async (signedUrl: string, file: File, contentType: string): Promise<void> => {
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType || file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
      }
    },
    []
  );

  const uploadImageWithSignedUrl = useCallback(
    async (
      file: File,
      options?: { folder?: string; expiresInSeconds?: number }
    ): Promise<UploadImageWithSignedUrlResult> => {
      if (!file) throw new Error('File is required');

      try {
        setLoading(true);
        setError(null);

        const signedData = await generateImageUploadSignedUrl({
          fileName: file.name,
          fileType: file.type,
          folder: options?.folder,
          expiresInSeconds: options?.expiresInSeconds,
        });

        await uploadFileToSignedUrl(signedData.signedUrl, file, file.type);

        return {
          objectUrl: signedData.objectUrl,
          key: signedData.key,
        };
      } catch (err: any) {
        const msg = err?.message || 'Failed to upload image';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [generateImageUploadSignedUrl, uploadFileToSignedUrl]
  );

  const deleteImagesFromS3 = useCallback(async (payload: DeleteImagesPayload): Promise<DeleteImagesResult> => {
    const imageUrls = Array.isArray(payload?.imageUrls) ? payload.imageUrls : [];
    const imageKeys = Array.isArray(payload?.imageKeys) ? payload.imageKeys : [];
    if (imageUrls.length === 0 && imageKeys.length === 0) {
      return { deletedKeys: [], deletedCount: 0 };
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ApiResponse<DeleteImagesResult>>('/aws/delete-images', {
        imageUrls,
        imageKeys,
      });
      const { success, data, message } = res.data;
      if (!success || !data) {
        throw new Error(message || 'Failed to delete images');
      }
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete images';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AwsUploadContextType>(
    () => ({
      loading,
      error,
      lastSignedUrlData,
      generateImageUploadSignedUrl,
      uploadFileToSignedUrl,
      uploadImageWithSignedUrl,
      deleteImagesFromS3,
      clearError,
    }),
    [
      loading,
      error,
      lastSignedUrlData,
      generateImageUploadSignedUrl,
      uploadFileToSignedUrl,
      uploadImageWithSignedUrl,
      deleteImagesFromS3,
      clearError,
    ]
  );

  return <AwsUploadContext.Provider value={value}>{children}</AwsUploadContext.Provider>;
};

export const useAwsUpload = (): AwsUploadContextType => {
  const ctx = useContext(AwsUploadContext);
  if (!ctx) throw new Error('useAwsUpload must be used within an AwsUploadProvider');
  return ctx;
};

export default AwsUploadContext;
