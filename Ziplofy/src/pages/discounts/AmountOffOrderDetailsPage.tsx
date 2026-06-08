import { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAmountOffOrderDiscount, type AmountOffOrderDiscountUsageOrder, type GetOrdersByAmountOffOrderDiscountResponse } from "../../contexts/amount-off-order-discount.context";
import { useStore } from "../../contexts/store.context";
import DiscountNotFound from "../../components/DiscountNotFound";
import DiscountDetailsHeader from "../../components/DiscountDetailsHeader";
import ChipList from "../../components/ChipList";

const AmountOffOrderDetailsPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { activeStoreId } = useStore();
	const {
		discounts,
		fetchDiscountsByStoreId,
		deleteDiscount,
		loading,
		error,
		fetchOrdersByDiscountId,
	} = useAmountOffOrderDiscount();

	const [ordersData, setOrdersData] = useState<GetOrdersByAmountOffOrderDiscountResponse | null>(null);
	const [ordersLoading, setOrdersLoading] = useState(false);

	const discount = discounts.find(d => d._id === id);

	useEffect(() => {
		if (activeStoreId && !discounts.length) {
			fetchDiscountsByStoreId(activeStoreId);
		}
	}, [activeStoreId, discounts.length, fetchDiscountsByStoreId]);

	useEffect(() => {
		if (!id) return;
		let cancelled = false;
		setOrdersLoading(true);
		fetchOrdersByDiscountId(id, { page: 1, limit: 20 })
			.then((res) => {
				if (!cancelled && res?.success) setOrdersData(res);
			})
			.catch(() => {
				if (!cancelled) setOrdersData(null);
			})
			.finally(() => {
				if (!cancelled) setOrdersLoading(false);
			});
		return () => { cancelled = true; };
	}, [id, fetchOrdersByDiscountId]);

	const handleBack = useCallback(() => {
		navigate('/discounts');
	}, [navigate]);

	const handleEdit = useCallback(() => {
		if (id) navigate(`/discounts/new/amount-off-order?edit=${id}`);
	}, [navigate, id]);

	const handleDelete = useCallback(async () => {
		if (!id) return;
		const confirmed = window.confirm('Are you sure you want to delete this discount? This action cannot be undone.');
		if (!confirmed) return;
		try {
			const result = await deleteDiscount(id);
			if (result?.success) navigate('/discounts');
		} catch (err) {
			console.error('Failed to delete discount:', err);
		}
	}, [id, deleteDiscount, navigate]);

	const renderBoolean = useCallback((v?: boolean) => (v ? 'Yes' : 'No'), []);
	const customerSegmentLabel = useCallback((s: any) => s?.name || s?._id, []);
	const customerLabel = useCallback((c: any) => {
		const fullName = `${c?.firstName || ''} ${c?.lastName || ''}`.trim();
		return fullName || c?.email || c?._id;
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-7xl mx-auto py-6 px-4">
				<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-sm text-red-800">{error}</p>
				</div>
			</div>
		);
	}

	if (!discount) {
		return <DiscountNotFound />;
	}

	const targetCustomerSegmentDetails = (discount as any).targetCustomerSegmentDetails || [];
	const targetCustomerDetails = (discount as any).targetCustomerDetails || [];

	// fixedAmount is stored in paisa; values < 1000 are legacy (rupees)
	const fixedDisplay = (discount.fixedAmount ?? 0) >= 1000 ? (discount.fixedAmount! / 100) : (discount.fixedAmount ?? 0);
	const value = discount.valueType === 'percentage' 
		? `${discount.percentage ?? 0}%` 
		: `₹${fixedDisplay}`;

	return (
		<div className="min-h-screen">
				<div className="max-w-7xl mx-auto py-6 px-4">
					<div className="flex flex-col gap-4">
						{/* Header */}
						<DiscountDetailsHeader
							method={discount.method}
							discountCode={discount.discountCode}
							title={discount.title}
							value={value}
							status={discount.status}
							onBack={handleBack}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>

						{/* General Information */}
						<div className="bg-white border border-gray-200 p-4">
							<h2 className="text-base font-medium mb-3 text-gray-900">General Information</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<p className="text-xs text-gray-600 mb-1">Method</p>
									<p className="text-sm text-gray-900">{discount.method}</p>
								</div>
								{discount.method === 'discount-code' && (
									<div>
										<p className="text-xs text-gray-600 mb-1">Code</p>
										<p className="text-sm text-gray-900">{discount.discountCode}</p>
									</div>
								)}
								{discount.method === 'automatic' && (
									<div>
										<p className="text-xs text-gray-600 mb-1">Title</p>
										<p className="text-sm text-gray-900">{discount.title}</p>
									</div>
								)}
								<div>
									<p className="text-xs text-gray-600 mb-1">Value Type</p>
									<p className="text-sm text-gray-900">{discount.valueType}</p>
								</div>
								{discount.valueType === 'percentage' && (
									<div>
										<p className="text-xs text-gray-600 mb-1">Percentage</p>
										<p className="text-sm text-gray-900">{discount.percentage}%</p>
									</div>
								)}
								{discount.valueType === 'fixed-amount' && (
									<div>
										<p className="text-xs text-gray-600 mb-1">Fixed Amount</p>
										<p className="text-sm text-gray-900">₹{fixedDisplay}</p>
									</div>
								)}
								<div>
									<p className="text-xs text-gray-600 mb-1">Eligibility</p>
									<p className="text-sm text-gray-900">{discount.eligibility}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Status</p>
									<p className="text-sm text-gray-900">{discount.status}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Created At</p>
									<p className="text-sm text-gray-900">{new Date(discount.createdAt).toLocaleDateString()}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Last Updated</p>
									<p className="text-sm text-gray-900">{new Date(discount.updatedAt).toLocaleDateString()}</p>
								</div>
							</div>
						</div>

						{/* Usage & Channel */}
						<div className="bg-white border border-gray-200 p-4">
							<h2 className="text-base font-medium mb-3 text-gray-900">Usage & Channel Limits</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<p className="text-xs text-gray-600 mb-1">Allow on Channels</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.allowDiscountOnChannels)}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Limit Total Uses</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.limitTotalUses)}</p>
								</div>
								{discount.limitTotalUses && (
									<div>
										<p className="text-xs text-gray-600 mb-1">Total Uses Limit</p>
										<p className="text-sm text-gray-900">{discount.totalUsesLimit}</p>
									</div>
								)}
								<div>
									<p className="text-xs text-gray-600 mb-1">One Use Per Customer</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.limitOneUsePerCustomer)}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Apply on POS Pro</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.applyOnPOSPro)}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Once Per Order</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.oncePerOrder)}</p>
								</div>
							</div>
						</div>

						{/* Minimum Purchase */}
						<div className="bg-white border border-gray-200 p-4">
							<h2 className="text-base font-medium mb-3 text-gray-900">Minimum Purchase</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<p className="text-xs text-gray-600 mb-1">Requirement</p>
									<p className="text-sm text-gray-900">{discount.minimumPurchase}</p>
								</div>
								{discount.minimumPurchase === 'minimum-amount' && (
									<div>
										<p className="text-xs text-gray-600 mb-1">Amount</p>
										<p className="text-sm text-gray-900">₹{discount.minimumAmount}</p>
									</div>
								)}
								{discount.minimumPurchase === 'minimum-quantity' && (
									<div>
										<p className="text-xs text-gray-600 mb-1">Quantity</p>
										<p className="text-sm text-gray-900">{discount.minimumQuantity}</p>
									</div>
								)}
							</div>
						</div>

						{/* Combinations */}
						<div className="bg-white border border-gray-200 p-4">
							<h2 className="text-base font-medium mb-3 text-gray-900">Combinations</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<p className="text-xs text-gray-600 mb-1">Product Discounts</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.productDiscounts)}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Order Discounts</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.orderDiscounts)}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Shipping Discounts</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.shippingDiscounts)}</p>
								</div>
							</div>
						</div>

						{/* Active Dates */}
						<div className="bg-white border border-gray-200 p-4">
							<h2 className="text-base font-medium mb-3 text-gray-900">Active Dates</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<p className="text-xs text-gray-600 mb-1">Start Date</p>
									<p className="text-sm text-gray-900">{discount.startDate} {discount.startTime ? `at ${discount.startTime}` : ''}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 mb-1">Set End Date</p>
									<p className="text-sm text-gray-900">{renderBoolean(discount.setEndDate)}</p>
								</div>
								{discount.setEndDate && (
									<div>
										<p className="text-xs text-gray-600 mb-1">End Date</p>
										<p className="text-sm text-gray-900">{discount.endDate} {discount.endTime ? `at ${discount.endTime}` : ''}</p>
									</div>
								)}
							</div>
						</div>

						{/* Eligibility: Customer Segments */}
						{Array.isArray(targetCustomerSegmentDetails) && targetCustomerSegmentDetails.length > 0 && (
							<div className="bg-white border border-gray-200 p-4">
								<h2 className="text-base font-medium mb-3 text-gray-900">Target Customer Segments</h2>
								<ChipList items={targetCustomerSegmentDetails.map((s: any, idx: number) => ({
									key: s?._id || idx.toString(),
									label: customerSegmentLabel(s)
								}))} />
							</div>
						)}

						{/* Eligibility: Customers */}
						{Array.isArray(targetCustomerDetails) && targetCustomerDetails.length > 0 && (
							<div className="bg-white border border-gray-200 p-4">
								<h2 className="text-base font-medium mb-3 text-gray-900">Target Customers</h2>
								<ChipList items={targetCustomerDetails.map((c: any, idx: number) => ({
									key: c?._id || idx.toString(),
									label: customerLabel(c)
								}))} />
							</div>
						)}

						{/* Orders where this discount was used */}
						<div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
							<div className="px-5 py-4 border-b border-gray-200">
								<h3 className="text-base font-semibold text-gray-900">Orders using this discount</h3>
								<p className="text-sm text-gray-500 mt-0.5">Orders where customers applied this amount off order discount</p>
							</div>
							<div className="p-5">
								{ordersLoading ? (
									<div className="flex justify-center py-8">
										<div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
									</div>
								) : ordersData && ordersData.data.length > 0 ? (
									<div className="space-y-4">
										<div className="overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-200">
												<thead>
													<tr className="bg-gray-50">
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Used at</th>
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-100">
													{ordersData.data.map((row: AmountOffOrderDiscountUsageOrder, idx: number) => (
														<tr key={idx} className="hover:bg-gray-50/50">
															<td className="px-4 py-3 text-sm text-gray-900">
																{row.customer ? (
																	<span>
																		{[row.customer.firstName, row.customer.lastName].filter(Boolean).join(' ').trim() || '—'}
																		{row.customer.email && (
																			<span className="block text-gray-500 text-xs">{row.customer.email}</span>
																		)}
																	</span>
																) : '—'}
															</td>
															<td className="px-4 py-3 text-sm text-gray-900">
																{row.order ? (
																	<span className="font-mono text-xs">#{String(row.order._id).slice(-8)}</span>
																) : '—'}
															</td>
															<td className="px-4 py-3 text-sm text-gray-900">
																{row.order ? `₹${(row.order.total / 100).toFixed(2)}` : '—'}
															</td>
															<td className="px-4 py-3 text-sm text-gray-500">
																{row.usage?.usedAt
																	? new Date(row.usage.usedAt).toLocaleString()
																	: '—'}
															</td>
															<td className="px-4 py-3">
																{row.order && (
																	<button
																		type="button"
																		onClick={() => navigate(`/orders/${row.order!._id}`)}
																		className="text-sm font-medium text-blue-600 hover:text-blue-800"
																	>
																		View order
																	</button>
																)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
										{ordersData.pagination && ordersData.pagination.totalItems > ordersData.pagination.itemsPerPage && (
											<p className="text-sm text-gray-500">
												Showing {ordersData.data.length} of {ordersData.pagination.totalItems} orders
											</p>
										)}
									</div>
								) : (
									<p className="text-sm text-gray-500 py-6 text-center">No orders have used this discount yet.</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
	);
};

export default AmountOffOrderDetailsPage;
