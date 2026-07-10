import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProductsSection from '../components/purchase-orders/AddProductsSection';
import AdditionalDetailsSection from '../components/purchase-orders/AdditionalDetailsSection';
import CostSummarySection from '../components/purchase-orders/CostSummarySection';
import ManageCostSummaryModal from '../components/purchase-orders/ManageCostSummaryModal';
import ShipmentSection from '../components/purchase-orders/ShipmentSection';
import SupplierDestinationSection from '../components/purchase-orders/SupplierDestinationSection';
import { useLocations } from '../contexts/location.context';
import { useProducts } from '../contexts/product.context';
import { usePurchaseOrderTags } from '../contexts/purchase-order-tags.context';
import { usePurchaseOrders } from '../contexts/purchase-order.context';
import { useStore } from '../contexts/store.context';
import { useVendors } from '../contexts/vendor.context';

const PurchaseOrderNewPage: React.FC = () => {
  // Supplier & destination
  const [supplierId, setSupplierId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [currency, setCurrency] = useState('INR');

  // Shipment
  const [eta, setEta] = useState('');
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');

  // Search/add products
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Array<{
    variantId: string;
    productTitle: string;
    productImage?: string;
    variantLabel: string; // e.g., "Black / Large"
    variantSku?: string;
    supplierSku: string;
    qty: number;
    cost: number;
    taxPct: number; // 0-100
  }>>([]);
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchSeqRef = useRef(0);
  const resultsRef = useRef<any[]>(results);
  useEffect(() => { resultsRef.current = results; }, [results]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(new Set());

  // Additional details
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.qty * it.cost, 0), [items]);
  const taxAmount = useMemo(() => 0, [subtotal]);
  const shippingCost = 0; // placeholder
  const [adjustmentsRows, setAdjustmentsRows] = useState<Array<{ type: string; amount: number }>>([]);
  const [manageOpen, setManageOpen] = useState(false);
  const adjustmentsTotal = useMemo(() => adjustmentsRows.reduce((sum, a) => sum + (a.type?.toLowerCase() === 'discount' ? -Math.abs(a.amount || 0) : (a.amount || 0)), 0), [adjustmentsRows]);
  const total = useMemo(() => subtotal + taxAmount + shippingCost + adjustmentsTotal, [subtotal, taxAmount, shippingCost, adjustmentsTotal]);

  // Product search with debounce
  const { activeStoreId } = useStore();
  const { searchProductWithVariantAndDestination } = useProducts();
  useEffect(() => {
    const q = search.trim();
    if (!q || !destinationId) {
      if (resultsRef.current.length > 0) setResults([]);
      return;
    }

    const seq = ++searchSeqRef.current; // bump request sequence
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data: any = await searchProductWithVariantAndDestination({
          storeId: activeStoreId!,
          q,
          destinationLocationId: destinationId,
        });
        if (seq === searchSeqRef.current) {
          setResults(Array.isArray(data) ? data : (data?.data || []));
        }
      } finally {
        if (seq === searchSeqRef.current) {
          setSearching(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search, destinationId, searchProductWithVariantAndDestination, activeStoreId]);

  // Data sources
  const { vendors, fetchVendorsByStoreId } = useVendors();
  const { locations, fetchLocationsByStoreId } = useLocations();
  const { tags, fetchTagsByStoreId, loading: tagsLoading } = usePurchaseOrderTags();
  const { createPurchaseOrder, loading: creatingPO } = usePurchaseOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeStoreId) fetchVendorsByStoreId?.(activeStoreId);
  }, [activeStoreId, fetchVendorsByStoreId]);
  useEffect(() => {
    if (activeStoreId) fetchLocationsByStoreId?.(activeStoreId);
  }, [activeStoreId, fetchLocationsByStoreId]);
  useEffect(() => {
    if (activeStoreId) fetchTagsByStoreId(activeStoreId).catch(() => {});
  }, [activeStoreId, fetchTagsByStoreId]);

  const paymentTermsOptions = useMemo(() => [
    { value: 'none', label: 'None' },
    { value: 'cash on delivery', label: 'Cash on delivery' },
    { value: 'payment on receipt', label: 'Payment on receipt' },
    { value: 'payment in advance', label: 'Payment in advance' },
    { value: 'net 7', label: 'Net 7' },
    { value: 'net 15', label: 'Net 15' },
    { value: 'net 30', label: 'Net 30' },
    { value: 'net 45', label: 'Net 45' },
    { value: 'net 60', label: 'Net 60' },
  ], []);

  const currencyOptions = useMemo(() => [
    { value: 'INR', label: 'INR' },
  ], []);

  const carrierOptions = useMemo(() => [
    '4PX-99 Minutos',
    'Aeronet',
    'ATS',
    'Amazon',
    'Amazon Logistics UK',
    'AMM Speedreturn',
    'AN Post',
    'Anjun Logistics',
    'Australia Post',
    'Better Trucks',
    'Bonshaw',
    'Border Express',
    'B Post',
    'B Post International',
    'Canada Post',
    'Cargo Expresso GT',
    'Cargo Expresso SV',
    'Deliver It',
    'Delivery'
  ].map(c => ({ value: c, label: c })), []);

  const vendorOptions = useMemo(() => (vendors || []).map((v: any) => ({
    value: v._id,
    label: v.name || v.title || 'Unnamed vendor'
  })), [vendors]);

  const locationOptions = useMemo(() => (locations || []).map((l: any) => ({
    value: l._id,
    label: l.name
  })), [locations]);

  const tagOptions = useMemo(() => tags.map(t => ({
    value: t._id,
    label: t.name
  })), [tags]);

  const adjustmentTypeOptions = useMemo(() => [
    { value: 'shipping', label: 'Shipping' },
    { value: 'discount', label: 'Discount' },
    { value: 'handling', label: 'Handling' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'surcharge', label: 'Surcharge' },
    { value: 'customs', label: 'Customs' },
    { value: 'duty', label: 'Duty' },
    { value: 'other', label: 'Other' },
  ], []);

  const handleAddSelected = useCallback(() => {
    const toAdd: typeof items = [];
    const selected = new Set(selectedVariantIds);
    for (const item of resultsRef.current) {
      for (const v of (item?.variants || [])) {
        if (selected.has(String(v._id))) {
          const variantLabel = (() => {
            const ov = v.optionValues || {};
            const parts = Object.values(ov).map((val: any) => String(val));
            return parts.join(' / ');
          })();
          toAdd.push({
            variantId: String(v._id),
            productTitle: item?.product?.title || 'Unnamed product',
            productImage: item?.product?.imageUrls?.[0],
            variantLabel,
            variantSku: v.sku,
            supplierSku: '',
            qty: 1,
            cost: 0,
            taxPct: 0,
          });
        }
      }
    }
    // de-duplicate on variantId (skip if already present)
    setItems(prev => {
      const existing = new Set(prev.map(p => p.variantId));
      const merged = [...prev];
      for (const row of toAdd) {
        if (!existing.has(row.variantId)) merged.push(row);
      }
      return merged;
    });
    setSelectedVariantIds(new Set());
  }, [selectedVariantIds]);

  const handleVariantToggle = useCallback((variantId: string) => {
    setSelectedVariantIds(prev => {
      const next = new Set(prev);
      const id = String(variantId);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleManageOpen = useCallback(() => {
    setAdjustmentsRows(prev => {
      // ensure a non-deletable shipping adjustment exists and is first
      const hasShipping = prev.some(r => (r.type || '').toLowerCase() === 'shipping');
      const rows = hasShipping ? prev : [{ type: 'shipping', amount: 0 }, ...prev];
      // move shipping to front if not already
      const idx = rows.findIndex(r => (r.type || '').toLowerCase() === 'shipping');
      if (idx > 0) {
        const copy = [...rows];
        const [ship] = copy.splice(idx, 1);
        copy.unshift(ship);
        return copy;
      }
      return rows;
    });
    setManageOpen(true);
  }, []);

  const handleCreatePurchaseOrder = useCallback(async () => {
    try {
      const body = {
        storeId: activeStoreId!,
        supplierId,
        destinationLocationId: destinationId,
        referenceNumber: reference || undefined,
        noteToSupplier: note || undefined,
        tags: tagIds,
        paymentTerm: paymentTerms || undefined,
        supplierCurrency: currency || undefined,
        shippingCarrier: carrier || undefined,
        trackingNumber: tracking || undefined,
        expectedArrivalDate: eta ? new Date(eta).toISOString() : undefined,
        status: 'draft' as const,
        costAdjustments: adjustmentsRows.map(a => ({ name: a.type, amount: a.amount })).concat([{ name: 'shipping', amount: 0 }]).reduce((acc, cur) => {
          // collapse shipping duplicates if any
          const idx = acc.findIndex(x => x.name === cur.name);
          if (idx === -1) acc.push(cur); else acc[idx] = { ...acc[idx], amount: acc[idx].amount + cur.amount };
          return acc;
        }, [] as Array<{ name: string; amount: number }>),
        entries: items.map(it => ({
          variantId: it.variantId,
          supplierSku: it.supplierSku || undefined,
          quantityOrdered: it.qty,
          cost: it.cost,
          taxPercent: it.taxPct || undefined,
        })),
      };
      await createPurchaseOrder(body as any);
      navigate('/products/purchase-orders');
    } catch (e) {
      // error is handled in context; optionally surface toast here
    }
  }, [activeStoreId, supplierId, destinationId, reference, note, tagIds, paymentTerms, currency, carrier, tracking, eta, adjustmentsRows, items, createPurchaseOrder, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/products/purchase-orders');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-page-background-color">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-medium text-gray-900">Create Purchase Order</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

          {/* Supplier & Destination */}
          <SupplierDestinationSection
            supplierId={supplierId}
            onSupplierIdChange={setSupplierId}
            destinationId={destinationId}
            onDestinationIdChange={setDestinationId}
            paymentTerms={paymentTerms}
            onPaymentTermsChange={setPaymentTerms}
            currency={currency}
            onCurrencyChange={setCurrency}
            vendorOptions={vendorOptions}
            locationOptions={locationOptions}
            paymentTermsOptions={paymentTermsOptions}
            currencyOptions={currencyOptions}
          />

          {/* Shipment */}
          <ShipmentSection
            eta={eta}
            onEtaChange={setEta}
            carrier={carrier}
            onCarrierChange={setCarrier}
            tracking={tracking}
            onTrackingChange={setTracking}
            carrierOptions={carrierOptions}
          />

          {/* Add Products */}
          <AddProductsSection
            search={search}
            onSearchChange={setSearch}
            searching={searching}
            results={results}
            selectedVariantIds={selectedVariantIds}
            onVariantToggle={handleVariantToggle}
            onAddSelected={handleAddSelected}
            items={items}
            onItemsChange={setItems}
          />

          {/* Additional details */}
          <AdditionalDetailsSection
            reference={reference}
            onReferenceChange={setReference}
            tagIds={tagIds}
            onTagIdsChange={setTagIds}
            note={note}
            onNoteChange={setNote}
            tagOptions={tagOptions}
            tagsLoading={tagsLoading}
          />

          {/* Cost summary */}
          <CostSummarySection
            itemsCount={items.length}
            subtotal={subtotal}
            taxAmount={taxAmount}
            adjustmentsTotal={adjustmentsTotal}
            adjustmentsRows={adjustmentsRows}
            shippingCost={shippingCost}
            total={total}
            onManageClick={handleManageOpen}
            onCancel={handleCancel}
            onCreatePurchaseOrder={handleCreatePurchaseOrder}
            creatingPO={creatingPO}
            canCreate={!creatingPO && !!activeStoreId && !!supplierId && !!destinationId && items.length > 0}
          />

          {/* Manage Cost Summary Dialog */}
          <ManageCostSummaryModal
            open={manageOpen}
            onClose={() => setManageOpen(false)}
            adjustmentsRows={adjustmentsRows}
            onAdjustmentsRowsChange={setAdjustmentsRows}
            adjustmentTypeOptions={adjustmentTypeOptions}
          />
        </div>
    </div>
  );
};

export default PurchaseOrderNewPage;
