import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Gift Card Timeline interface (matches API response structure)
export interface GiftCardTimeline {
  _id: string;
  giftCardId: string;
  type: 'comment' | 'event';
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Create timeline entry request interface
export interface CreateTimelineEntryRequest {
  giftCardId: string;
  comment: string;
}

// Update timeline entry request interface
export interface UpdateTimelineEntryRequest {
  comment: string;
}

// API Response interfaces
interface CreateTimelineEntryResponse {
  success: boolean;
  data: GiftCardTimeline;
  message: string;
}

interface GetTimelineByGiftCardIdResponse {
  success: boolean;
  data: GiftCardTimeline[];
  count: number;
}

interface UpdateTimelineEntryResponse {
  success: boolean;
  data: GiftCardTimeline;
  message: string;
}

interface DeleteTimelineEntryResponse {
  success: boolean;
  data: {
    deletedTimelineEntry: {
      id: string;
      type: string;
      comment: string;
    };
  };
  message: string;
}

// Gift Card Timeline context interface
interface GiftCardTimelineContextType {
  timelineEntries: GiftCardTimeline[];
  loading: boolean;
  error: string | null;
  
  // Functions
  getTimelineByGiftCardId: (giftCardId: string) => Promise<void>;
  createTimelineEntry: (payload: CreateTimelineEntryRequest) => Promise<GiftCardTimeline>;
  updateTimelineEntry: (timelineId: string, payload: UpdateTimelineEntryRequest) => Promise<GiftCardTimeline>;
  deleteTimelineEntry: (timelineId: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  clearTimelineEntries: () => void;
}

// Create context
const GiftCardTimelineContext = createContext<GiftCardTimelineContextType | undefined>(undefined);

// Gift Card Timeline provider component
export const GiftCardTimelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timelineEntries, setTimelineEntries] = useState<GiftCardTimeline[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get timeline entries by gift card ID
  const getTimelineByGiftCardId = useCallback(async (giftCardId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get<GetTimelineByGiftCardIdResponse>(`/gift-card-timeline/gift-card/${giftCardId}`);
      const { success, data } = response.data;
      
      if (success) {
        setTimelineEntries(data);
      } else {
        setError('Failed to fetch timeline entries');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch timeline entries';
      setError(errorMessage);
      console.error('Error fetching timeline entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new timeline entry
  const createTimelineEntry = useCallback(async (payload: CreateTimelineEntryRequest): Promise<GiftCardTimeline> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.post<CreateTimelineEntryResponse>('/gift-card-timeline', payload);
      const { success, data } = response.data;
      
      if (success) {
        // Add the new timeline entry to the existing array (prepend for recency)
        setTimelineEntries(prevEntries => [data, ...prevEntries]);
        return data;
      } else {
        throw new Error('Failed to create timeline entry');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create timeline entry';
      setError(errorMessage);
      console.error('Error creating timeline entry:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing timeline entry
  const updateTimelineEntry = useCallback(async (timelineId: string, payload: UpdateTimelineEntryRequest): Promise<GiftCardTimeline> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.put<UpdateTimelineEntryResponse>(`/gift-card-timeline/${timelineId}`, payload);
      const { success, data } = response.data;
      
      if (success) {
        // Update the timeline entry in the existing array
        setTimelineEntries(prevEntries => 
          prevEntries.map(entry => 
            entry._id === timelineId ? data : entry
          )
        );
        return data;
      } else {
        throw new Error('Failed to update timeline entry');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update timeline entry';
      setError(errorMessage);
      console.error('Error updating timeline entry:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a timeline entry
  const deleteTimelineEntry = useCallback(async (timelineId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.delete<DeleteTimelineEntryResponse>(`/gift-card-timeline/${timelineId}`);
      const { success } = response.data;
      
      if (success) {
        // Remove the timeline entry from the existing array
        setTimelineEntries(prevEntries => 
          prevEntries.filter(entry => entry._id !== timelineId)
        );
      } else {
        throw new Error('Failed to delete timeline entry');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete timeline entry';
      setError(errorMessage);
      console.error('Error deleting timeline entry:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear timeline entries
  const clearTimelineEntries = useCallback(() => {
    setTimelineEntries([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: GiftCardTimelineContextType = {
    timelineEntries,
    loading,
    error,
    getTimelineByGiftCardId,
    createTimelineEntry,
    updateTimelineEntry,
    deleteTimelineEntry,
    clearError,
    clearTimelineEntries,
  };

  return (
    <GiftCardTimelineContext.Provider value={value}>
      {children}
    </GiftCardTimelineContext.Provider>
  );
};

// Custom hook to use gift card timeline context
export const useGiftCardTimeline = (): GiftCardTimelineContextType => {
  const context = useContext(GiftCardTimelineContext);
  if (context === undefined) {
    throw new Error('useGiftCardTimeline must be used within a GiftCardTimelineProvider');
  }
  return context;
};

export default GiftCardTimelineContext;
