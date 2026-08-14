Here’s the full honest list from what’s actually stored in `codiic-server`. Not 5–6 — everything we can still add as **real** analytics.

## Already on `/analytics` (overview of every section)
**Sales** — gross / total / tax / shipping, orders, fulfilled, AOV, unpaid/unfulfilled, sales over time, breakdown, payment method, recent orders  
**Products** — margin, digital mix, catalog, markdown, sales by product, sell-through  
**Inventory** — on-hand / available / committed / value / cover / incoming, sold-out + low-stock list  
**Customers** — new / buyers / returning / repeat / opt-in, AOV over time, sales by location, top customers  
**Content / CRM** — newsletter list health + movement, contact inbox/status/phone/recent, blog catalog + authors/tags/comments, page SEO + templates  
**Live** — visitors, carts, checkout, live sales, sessions by device + location  

Specialist pages still have the full tables.

---

## More we can show (real data)

### Sales & money
1. **Total sales** (`order.total` = subtotal + shipping + tax) — different from gross  
2. **Tax collected**  
3. **Shipping revenue**  
4. **AOV on total** (not just subtotal)  
5. **Median / P90 order value**  
6. **Orders over time** chart  
7. **Units sold over time**  
8. **Paid GMV vs unpaid GMV**  
9. **COD vs prepaid mix**  
10. **Items per order / unique SKUs per basket**  
11. **Billing ≠ shipping rate**

### Payments (UTR / bank / UPI confirm flow)
12. **UTR submissions count**  
13. **Verification rate** (verified ÷ submitted)  
14. **Time to verify payment**  
15. **Payment status mix** (unpaid vs paid)

### Customers ✅ (now on `/analytics/customers`)
16. **New customers** (signups in range)  
17. **Customers who purchased** vs signups who never bought  
18. **New vs returning buyers** (buyer version, not just rate)  
19. **Customer LTV** distribution  
20. **Orders per customer**  
21. **Time to first purchase**  
22. **Recency** (last order age)  
23. **Purchase frequency**  
24. **Email marketing opt-in %**  
25. **SMS opt-in %**  
26. **Customers by tag**  
27. **Segment size + GMV** (manual segments)  
28. **Language mix**  
29. **AOV by country / state / city**  
30. **Sales by pin code**

### Products & catalog ✅ (now on `/analytics/products`)
32. **Top SKUs / variant options** (not just product)  
33. **SKU velocity** (units / day)  
34. **Sales by vendor**  
35. **Sales by product type**  
36. **Sales by category**  
37. **Sales by product tag**  
38. **Collection performance** (careful: products in many collections can double-count)  
39. **Estimated gross margin** (sold qty × current cost vs line total)  
40. **Digital vs physical mix**  
41. **Active vs draft catalog size**  
42. **Compare-at / markdown signal** (weak — uses current compare-at, not at sale time)

### Inventory ops ✅ (now on `/analytics/inventory`)
43. **On-hand / available / committed / incoming** by SKU or location  
44. **Unavailable breakdown** (damaged / QC / safety / other)  
45. **Inventory value** (on-hand × cost)  
46. **Days of cover** (on-hand ÷ recent velocity)  
47. **Stock by location**  
48. **Committed inventory** (open orders still holding stock)

### Discounts (counts only — **no ₹ off**)
49. **Total redemptions**  
50. **Redemptions by campaign/code**  
51. **Automatic vs discount code**  
52. **Unique redeemers**  
53. **Discount attach rate** (% of orders that used a discount)  
54. **Mix: amount-off order / product / BXGY / free shipping**  
55. **Limit utilization** (uses vs max uses)

### Carts (current snapshot, not history)
56. **Customers with an open cart right now**  
57. **Open cart GMV estimate**  
58. **Stale-cart proxy** (cart not updated in N hours, no later order)  
59. **Live visitors in cart / checkout** (already in Live View; can surface here too)

### Gift cards (issued only)
60. **Issued count**  
61. **Issued face value**  
62. **Active vs expired**  
   (cannot show redeemed / outstanding balance)

### Purchase orders & transfers
63. **PO spend**  
64. **Open PO value**  
65. **PO status mix**  
66. **PO fill rate** (received ÷ ordered)  
67. **On-time receipt**  
68. **Supplier spend ranking**  
69. **Incoming pipeline**  
70. **Transfer volume / in-transit**  
71. **Transfer cycle time**

### Content / CRM ✅ (now on `/analytics/content`) ✅
72. **Newsletter signups / unsubs / net list / subscribe rate / list mix**  
73. **Contact volume / unread / read / spam rates / phone mix / recent inbox**  
74. **Blog posts published / created / visibility / authors / tags / featured image / excerpt**  
75. **Blog comments / pending / spam rate / most commented posts**  
76. **Pages published / SEO title / meta / content / theme templates / recent pages**

### Live only (in-memory, resets on server restart)
77. **Live visitor count**  
78. **Live new vs returning**  
79. **Live IP-geo** (already have location chart)  
80. **Live orders / GMV since server boot**  
81. **Live top products since boot**

---