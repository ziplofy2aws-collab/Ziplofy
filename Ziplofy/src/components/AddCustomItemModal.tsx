import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from './Modal';

export interface CustomItem {
  name: string;
  price: number;
  quantity: number;
  isTaxable: boolean;
  isPhysicalProduct: boolean;
  weight?: number;
}

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: CustomItem) => void;
}

const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState<CustomItem>({
    name: '',
    price: 0,
    quantity: 1,
    isTaxable: true,
    isPhysicalProduct: true,
    weight: undefined,
  });

  const handleInputChange = useCallback(
    (field: keyof CustomItem, value: string | number | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!formData.name.trim() || formData.price <= 0 || formData.quantity <= 0) {
      return; // Basic validation
    }
    onAdd(formData);
    // Reset form
    setFormData({
      name: '',
      price: 0,
      quantity: 1,
      isTaxable: true,
      isPhysicalProduct: true,
      weight: undefined,
    });
    onClose();
  }, [formData, onAdd, onClose]);

  const handleCancel = useCallback(() => {
    // Reset form
    setFormData({
      name: '',
      price: 0,
      quantity: 1,
      isTaxable: true,
      isPhysicalProduct: true,
      weight: undefined,
    });
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={isOpen}
      onClose={handleCancel}
      title="Add custom item"
      maxWidth="md"
      actions={
        <>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Item Name, Price, and Quantity Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Item Name */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Item name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Item name"
              className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          {/* Price */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          {/* Quantity */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          {/* Item is taxable */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isTaxable}
              onChange={(e) => handleInputChange('isTaxable', e.target.checked)}
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">Item is taxable</span>
          </label>

          {/* Item is a physical product */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPhysicalProduct}
              onChange={(e) => handleInputChange('isPhysicalProduct', e.target.checked)}
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
            />
            <span className="text-sm text-gray-700">Item is a physical product</span>
          </label>
        </div>

        {/* Item Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Item weight (optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
            placeholder="0.00"
            className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Used to calculate shipping rates accurately
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AddCustomItemModal;
