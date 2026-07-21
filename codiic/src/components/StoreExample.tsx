import React, { useState } from 'react';
import { useStore } from '../contexts/store.context';

// Example component showing how to use the store context
const StoreExample: React.FC = () => {
  const { store, loading, error, fetchStore, createStore, updateStore, deleteStore } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCreateStore = async () => {
    try {
      setIsCreating(true);
      await createStore({
        storeName: "My Awesome Store",
        storeDescription: "A modern e-commerce store specializing in handmade jewelry and accessories."
      });
      console.log('Store created successfully!');
    } catch (err) {
      console.error('Failed to create store:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!store) return;
    
    try {
      setIsUpdating(true);
      await updateStore(store._id, {
        storeName: "Updated Store Name",
        storeDescription: "Updated store description with new details."
      });
      console.log('Store updated successfully!');
    } catch (err) {
      console.error('Failed to update store:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!store) return;
    
    try {
      await deleteStore(store._id);
      console.log('Store deleted successfully!');
    } catch (err) {
      console.error('Failed to delete store:', err);
    }
  };

  if (loading) {
    return <div>Loading store...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Store Management</h2>
      
      {store ? (
        <div>
          <h3>Current Store</h3>
          <p><strong>Name:</strong> {store.storeName}</p>
          <p><strong>Description:</strong> {store.storeDescription}</p>
          <p><strong>Created:</strong> {new Date(store.createdAt).toLocaleDateString()}</p>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={handleUpdateStore} 
              disabled={isUpdating}
              style={{ marginRight: '10px' }}
            >
              {isUpdating ? 'Updating...' : 'Update Store'}
            </button>
            
            <button 
              onClick={handleDeleteStore}
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              Delete Store
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>No store found. Create one to get started!</p>
          <button 
            onClick={handleCreateStore} 
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Store'}
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={fetchStore}>
          Refresh Store Data
        </button>
      </div>
    </div>
  );
};

export default StoreExample;
