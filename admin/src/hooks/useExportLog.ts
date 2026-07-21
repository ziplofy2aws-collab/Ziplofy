import { useCallback } from 'react';
import axios from '../config/axios';
import toast from 'react-hot-toast';

/**
 * Hook to export CSV data and log it for super-admin audit.
 * Call this when user exports from any page.
 */
export function useExportLog() {
  const exportAndLog = useCallback(
    async (params: {
      page: string;
      csvContent: string;
      fileName: string;
      onSuccess?: () => void;
    }) => {
      const { page, csvContent, fileName, onSuccess } = params;

      try {
        // 1. Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        // 2. Log export (fire-and-forget, don't block user)
        axios
          .post('/activity-logs/export', {
            page,
            csvContent,
            fileName,
          })
          .catch((err) => {
            console.warn('Export log failed:', err);
            // Still show success - export worked
          });

        onSuccess?.();
      } catch (err) {
        console.error('Export failed:', err);
        toast.error('Export failed');
      }
    },
    []
  );

  return { exportAndLog };
}
