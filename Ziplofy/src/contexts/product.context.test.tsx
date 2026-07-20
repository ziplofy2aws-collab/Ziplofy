import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ProductProvider, useProducts, type Product } from './product.context';

vi.mock('../config/axios.config', () => ({
  axiosi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const TestConsumer = () => {
  const { products, fetchProductsByStoreId, createProduct } = useProducts();
  React.useEffect(() => {
    fetchProductsByStoreId('s1');
  }, [fetchProductsByStoreId]);
  return (
    <div>
      <span data-testid="count">{products.length}</span>
      <button
        onClick={() =>
          createProduct({
            title: 'New',
            description: 'Desc',
            category: 'c1',
            price: 100,
            chargeTax: true,
            cost: 50,
            profit: 50,
            marginPercent: 50,
            storeId: 's1',
            inventoryTrackingEnabled: false,
            continueSellingWhenOutOfStock: false,
            sku: 'SKU',
            barcode: 'BAR',
            isPhysicalProduct: true,
            variants: [],
            pageTitle: 'New',
            metaDescription: 'Meta',
            urlHandle: 'new',
            status: 'active',
            onlineStorePublishing: true,
            pointOfSalePublishing: false,
            tagIds: [],
          } as any)
        }
      >
        create
      </button>
    </div>
  );
};

describe('ProductProvider / useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchProductsByStoreId populates products', async () => {
    const { axiosi } = await import('../config/axios.config');
    const list: Product[] = [
      {
        _id: 'p1',
        storeId: 's1',
        title: 'P1',
        description: '',
        category: { _id: 'c1', name: 'Cat', parent: null, hasChildren: false, createdAt: '', updatedAt: '' },
        price: 100,
        chargeTax: true,
        cost: 50,
        inventoryTrackingEnabled: false,
        sku: '',
        barcode: '',
        continueSellingWhenOutOfStock: false,
        isPhysicalProduct: true,
        package: {
          _id: 'pkg',
          storeId: 's1',
          packageName: '',
          packageType: 'box',
          length: 0,
          width: 0,
          height: 0,
          dimensionsUnit: 'cm',
          weight: 0,
          weightUnit: 'kg',
          isDefault: false,
          createdAt: '',
          updatedAt: '',
        },
        productWeight: 0,
        productWeightUnit: '',
        countryOfOrigin: '',
        harmonizedSystemCode: '',
        variants: [],
        pageTitle: '',
        metaDescription: '',
        urlHandle: '',
        profit: 0,
        marginPercent: 0,
        status: 'active',
        onlineStorePublishing: true,
        pointOfSalePublishing: false,
        productType: { _id: 't1', storeId: 's1', name: '', createdAt: '', updatedAt: '', __v: 0 },
        vendor: { _id: 'v1', storeId: 's1', name: '', createdAt: '', updatedAt: '' },
        tagIds: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    (axiosi.get as any).mockResolvedValue({ data: { success: true, data: list, count: 1 } });

    render(
      <ProductProvider>
        <TestConsumer />
      </ProductProvider>,
    );

    await waitFor(() => expect(document.querySelector('[data-testid="count"]')!.textContent).toBe('1'));
  });

  it('throws when useProducts used outside provider', () => {
    const Bad = () => {
      useProducts();
      return null;
    };
    expect(() => render(<Bad />)).toThrow(/useProducts must be used within a ProductProvider/);
  });
});

