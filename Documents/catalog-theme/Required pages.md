# Required page templates

Required pages for a valid installable remote theme. Declare each template id in `theme.manifest.json` → `templates` and implement the matching runtime route. That list is authoritative per pack. Schema also describes each template’s sections.

Pages that need live data must use the APIs documented in [E-commerce runtime APIs.md](./E-commerce%20runtime%20APIs.md).

| # | Template id | Page | Typical route | What it does |
| --- | --- | --- | --- | --- |
| 1 | `index` | Home | `/` | Displays the storefront home page |
| 2 | `product` | Product details (PDP) | `/products/{urlHandle}` | Displays a single product’s details |
| 3 | `search` | Search results | `/search` | Displays product search results |
| 4 | `collections_list` | Collections index | `/collections` | Displays all collections |
| 5 | `all_products` | All products | `/collections/all` | Displays all products in the store |
| 6 | `404` | Not found | (fallback) | Displays the page-not-found / error page |
| 7 | `collection` | Collection details | `/collections/{urlHandle}` | Displays one collection and its products |
| 8 | `all_blogs` | All blogs | `/blogs/all` | Displays all blogs for the store |
| 9 | `blogs` | Blog details | `/blogs/{urlHandle}` | Displays one blog and its posts |
| 10 | `blog_posts` | Blog post details | `/blogs/{blogUrlHandle}/{postUrlHandle}` | Displays a single blog post / article |
| 11 | `cart` | Cart | `/cart` | Displays the shopping cart |
| 12 | `login` | Login | `/auth/login` | Displays customer sign-in |
| 13 | `signup` | Sign up | `/auth/signup` | Displays customer registration |
| 14 | `forgot_password` | Forgot password | `/auth/forgot` | Displays password recovery |
| 15 | `profile` | Profile | `/profile` | Displays the customer profile, including preferences as a section on this page (not a separate template) |
| 16 | `orders` | Orders | `/my-orders` | Displays the customer’s orders |
| 17 | `order_details` | Order details | `/my-orders/{orderId}` | Displays a single order’s details (line items, totals, shipping, status) |

← Back to [Introduction.md](./Introduction.md)
