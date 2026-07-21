import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCustomItemModal, { CustomItem } from '../components/AddCustomItemModal';
import OrderCustomerSection, { CustomerInfo } from '../components/OrderCustomerSection';
import OrderNotesSection from '../components/OrderNotesSection';
import OrderPaymentSection, { PaymentSummary } from '../components/OrderPaymentSection';
import { OrderProductItemData } from '../components/OrderProductItem';
import OrderProductSearchSection from '../components/OrderProductSearchSection';
import PaymentDueLetterSection from '../components/PaymentDueLetterSection';

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<OrderProductItemData[]>([
    {
      id: '1',
      collectionName: 'Collection Name',
      productName: 'Gaming Console',
      variant: 'Medium',
      color: 'Gray',
      colorSwatch: '#9CA3AF',
      quantity: 3,
      unitPrice: 500.0,
      totalPrice: 1500.0,
    },
  ]);
  const [orderNotes, setOrderNotes] = useState('');
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'Alex Jander',
    orderCount: 0,
    isTaxExempt: true,
  });
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);

  const handleBack = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  const handleProductsChange = useCallback((updatedProducts: OrderProductItemData[]) => {
    setProducts(updatedProducts);
  }, []);

  const handleAddCustomItem = useCallback(() => {
    setIsCustomItemModalOpen(true);
  }, []);

  const handleCloseCustomItemModal = useCallback(() => {
    setIsCustomItemModalOpen(false);
  }, []);

  const handleAddCustomItemSubmit = useCallback(
    (customItem: CustomItem) => {
      const newProduct: OrderProductItemData = {
        id: `custom-${Date.now()}`,
        productName: customItem.name,
        quantity: customItem.quantity,
        unitPrice: customItem.price,
        totalPrice: customItem.price * customItem.quantity,
      };
      setProducts((prev) => [...prev, newProduct]);
      setIsCustomItemModalOpen(false);
    },
    []
  );

  const handleBrowse = useCallback(() => {
    console.log('Browse clicked');
    // TODO: Implement browse functionality
  }, []);

  const handleEditPaymentDue = useCallback(() => {
    console.log('Edit payment due clicked');
    // TODO: Implement edit payment due functionality
  }, []);

  const handlePaymentTermsChange = useCallback((terms: string) => {
    console.log('Payment terms changed:', terms);
    // TODO: Update payment terms
  }, []);

  const handleSetupReminders = useCallback(() => {
    console.log('Setup automatic payment reminders clicked');
    // TODO: Navigate to reminders setup page
  }, []);

  const handleCancel = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  const handleCreateOrder = useCallback(() => {
    console.log('Create order clicked');
    // TODO: Implement create order functionality
  }, []);

  const handleNotesChange = useCallback((notes: string) => {
    setOrderNotes(notes);
  }, []);

  const handleCreateNewCustomer = useCallback(() => {
    navigate('/customers/new');
  }, [navigate]);

  // Calculate payment summary from products
  const paymentSummary = useMemo<PaymentSummary>(() => {
    const subtotal = products.reduce((sum, product) => sum + product.totalPrice, 0);
    const itemCount = products.reduce((sum, product) => sum + product.quantity, 0);
    const discount = {
      amount: 1.0,
      description: 'New customer',
    };
    const shipping = {
      cost: 0.0,
      description: 'Free shipping (0.0 lb)',
    };
    const total = subtotal - (discount?.amount || 0) + (shipping?.cost || 0);

    return {
      subtotal,
      itemCount,
      discount,
      shipping,
      total,
      paidByCustomer: 0.0,
      paymentDueDescription: 'Payment due when invoice is sent',
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Orders</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Order</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add products, set payment terms, and create a new order for your customer
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Product Search Section */}
          <OrderProductSearchSection
            products={products}
            onProductsChange={handleProductsChange}
            onAddCustomItem={handleAddCustomItem}
            onBrowse={handleBrowse}
          />

          {/* Payment Section */}
          <OrderPaymentSection
            paymentSummary={paymentSummary}
            onEditPaymentDue={handleEditPaymentDue}
          />


          {/* Payment Due Letter Section */}
          <PaymentDueLetterSection
            paymentTerms="Due on receipt"
            onPaymentTermsChange={handlePaymentTermsChange}
            onCancel={handleCancel}
            onCreateOrder={handleCreateOrder}
            onSetupReminders={handleSetupReminders}
          />
          {/* Notes Section */}
          <OrderNotesSection notes={orderNotes} onNotesChange={handleNotesChange} />
        
        {/* Customer Section */}
        <OrderCustomerSection
          customer={customer}
          onCreateNewCustomer={handleCreateNewCustomer}
        />
        </div>
      </div>

      {/* Add Custom Item Modal */}
      <AddCustomItemModal
        isOpen={isCustomItemModalOpen}
        onClose={handleCloseCustomItemModal}
        onAdd={handleAddCustomItemSubmit}
      />
    </div>
  );
};

export default CreateOrderPage;

