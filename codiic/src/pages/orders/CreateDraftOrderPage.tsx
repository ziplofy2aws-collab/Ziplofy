import { PencilSquareIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';
import AddCustomItemModal, { type CustomItem } from '../../components/AddCustomItemModal';
import DraftOrderCustomerSection from '../../components/orders/draft-order/DraftOrderCustomerSection';
import DraftOrderMarketsSection from '../../components/orders/draft-order/DraftOrderMarketsSection';
import DraftOrderNotesSection from '../../components/orders/draft-order/DraftOrderNotesSection';
import DraftOrderPaymentSection from '../../components/orders/draft-order/DraftOrderPaymentSection';
import DraftOrderProductsSection from '../../components/orders/draft-order/DraftOrderProductsSection';
import DraftOrderTagsSection from '../../components/orders/draft-order/DraftOrderTagsSection';

type DraftLineItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

const CreateDraftOrderPage: React.FC = () => {
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [tags, setTags] = useState('');
  const [customItemModalOpen, setCustomItemModalOpen] = useState(false);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [lineItems]
  );

  const handleAddProduct = useCallback(() => {
    // Placeholder until product picker is implemented
  }, []);

  const handleAddCustomItem = useCallback(() => {
    setCustomItemModalOpen(true);
  }, []);

  const handleCustomItemSubmit = useCallback((item: CustomItem) => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      },
    ]);
    setCustomItemModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <PencilSquareIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
          <h1 className="text-lg font-semibold text-gray-900">Create order</h1>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start">
          <div className="space-y-4">
            <DraftOrderProductsSection
              onAddProduct={handleAddProduct}
              onAddCustomItem={handleAddCustomItem}
            />
            <DraftOrderPaymentSection
              hasProducts={lineItems.length > 0}
              subtotal={subtotal}
              total={subtotal}
            />
          </div>

          <div className="space-y-4">
            <DraftOrderNotesSection notes={notes} onNotesChange={setNotes} />
            <DraftOrderCustomerSection
              searchQuery={customerSearch}
              onSearchChange={setCustomerSearch}
            />
            <DraftOrderMarketsSection />
            <DraftOrderTagsSection tags={tags} onTagsChange={setTags} />
          </div>
        </div>
      </div>

      <AddCustomItemModal
        isOpen={customItemModalOpen}
        onClose={() => setCustomItemModalOpen(false)}
        onAdd={handleCustomItemSubmit}
      />
    </div>
  );
};

export default CreateDraftOrderPage;
