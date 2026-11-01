# Rainy Days Website

 HTML, CSS, and Vanilla JavaScript storefront for browsing and purchasing Rainy Days jackets.
 Adding dynamic product data and a simulated shopping experience.

## Pages

- `index.html` — Home page with featured products.
- `products.html` — All products catalog.
- `category/mens-clothing.html` — Men's jackets.
- `category/womens-clothing.html` — Women's jackets.
- `product/index.html?id=<product-id>` — Product description, price and size selection.
- `cart.html` — Shopping cart.
- `checkout/index.html` — Checkout and order summary.
- `checkout/confirmation/index.html` — Order confirmation.
- `privacy.html` and `terms.html` — Policies , Terms and Conditions.

## Project structure

- `css` — Shared and page-specific stylesheets.
- `js` — Product loading, product details, cart, checkout, and confirmation scripts.
- `images` — Store logos and page images.
- `category`, `product`, and `checkout` — Route-specific pages.

## Run locally

The project requires a local web server because it uses JavaScript modules. No build step or package installation is required.
Clone or download this repository. Open the project folder in Visual Studio Code. Run in live server.

## API

Product data and images are fetched from the Noroff Rainy Days API.

Endpoint: https://v2.api.noroff.dev/rainy-days

## Local Storage

The shopping cart is stored in localStorage in cart. It contains a product description, selected size and quantity and price.
Completing a demo purchase clears the cart. it does not process payments or send an order to a server.

## Shopping Cart and Checkout Features

- Add Products to Cart : Add jackets in different sizes to the shopping cart.
- Cart Persistence : Keep cart items saved while navigating between pages and after refreshing the browser.
- Manage Cart Items : Increase or decrease the quantity of individual items and remove items from the cart when needed.
- Empty Cart Handling : Display a helpful message when the shopping cart is empty.
- Checkout Form Validation : Require essential checkout fields and validate the email address before allowing the user to proceed.
- Loading Indicators : Display loading indicators while fetching product data, particularly when the internet connection is slow.
- Successful Checkout : Display an order confirmation message after a successful checkout and automatically clear the shopping cart.

## Resources and Acknowledgements

- Product Data and Images : Sourced from the [Noroff Rainy Days API](https://v2.api.noroff.dev/rainy-days).
- AI Assistance : AI tools were used during development; see [AI_USAGE.MD](./AI_USAGE.MD) for details.


