import React, { useCallback, useMemo } from 'react';
import AbandonedCartCustomerCell from './AbandonedCartCustomerCell';

interface CartItem {
  _id: string;
  productVariant: {
    images?: string[];
    sku: string;
    price: number;
    optionValues: Record<string, string>;
  };
  quantity: number;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface Cart {
  customer: Customer;
  totalItems: number;
  cartItems: CartItem[];
  lastUpdated: string;
}

interface AbandonedCartCardProps {
  cart: Cart;
  formatDate: (dateString: string) => string;
  customerPopoverOpen: boolean;
  onToggleCustomerPopover: (rowId: string) => void;
  onSendEmail: (customer: Customer) => void;
  onViewDetails: (customerId: string) => void;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const AbandonedCartCard: React.FC<AbandonedCartCardProps> = ({
  cart,
  formatDate,
  customerPopoverOpen,
  onToggleCustomerPopover,
  onSendEmail,
  onViewDetails,
}) => {
  const handleSendEmail = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSendEmail(cart.customer);
    },
    [cart.customer, onSendEmail]
  );

  const handleViewDetails = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onViewDetails(cart.customer._id);
    },
    [cart.customer._id, onViewDetails]
  );

  const calculateTotal = useMemo(() => {
    return cart.cartItems.reduce((sum, item) => sum + item.productVariant.price * item.quantity, 0);
  }, [cart.cartItems]);

  const previewImages = useMemo(() => {
    const urls: string[] = [];
    for (const item of cart.cartItems) {
      const img = item.productVariant.images?.[0];
      if (img && urls.length < 3) urls.push(img);
    }
    return urls;
  }, [cart.cartItems]);

  const customerName = `${cart.customer.firstName} ${cart.customer.lastName}`.trim();

  return (
    <tr
      className="cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50/80"
      onClick={() => handleViewDetails()}
    >
      <td className="whitespace-nowrap px-3 py-2.5">
        <AbandonedCartCustomerCell
          rowId={cart.customer._id}
          customer={{
            customerId: cart.customer._id,
            name: customerName,
            email: cart.customer.email,
            phoneNumber: cart.customer.phoneNumber,
            cartItemCount: cart.totalItems,
            cartValue: calculateTotal,
          }}
          isOpen={customerPopoverOpen}
          onToggle={onToggleCustomerPopover}
        />
      </td>

      <td className="px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-gray-700">
              {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
            </p>
            <p className="text-[13px] font-medium text-gray-900">{formatCurrency(calculateTotal)}</p>
          </div>
          {previewImages.length > 0 ? (
            <div className="flex -space-x-1">
              {previewImages.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="h-7 w-7 overflow-hidden rounded border border-gray-200 bg-gray-50"
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-700">
        {formatDate(cart.lastUpdated)}
      </td>

      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        <button
          type="button"
          onClick={handleSendEmail}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[12px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
        >
          Send email
        </button>
      </td>
    </tr>
  );
};

export default AbandonedCartCard;
