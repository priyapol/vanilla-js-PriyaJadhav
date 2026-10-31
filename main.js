const headerCartButton = document.querySelector(".cart-btn");
const CART_STORAGE_KEY = "rainy-days-cart";
let products = [];

function productPrice(product) {
    return productIsDiscounted(product) ? product.discountedPrice : product.price;
}

function productIsDiscounted(product) {
    return product.onSale === true &&
        Number.isFinite(product.price) &&
        Number.isFinite(product.discountedPrice) &&
        product.discountedPrice < product.price;
}

function productPrice(product) {
    if (product.onSale && product.discountedPrice < product.price) {
        return product.discountedPrice;
    }

    return product.price;
}

function renderProductPrice(priceElement, product) {
    priceElement.innerHTML = "";

    if (product.onSale && product.discountedPrice < product.price) {
        priceElement.innerHTML =
            '<del class="price-original">' + product.price.toFixed(2) + ' NOK</del> ' +
            '<strong class="price-discount">' + product.discountedPrice.toFixed(2) + ' NOK</strong> ' +
            '<span class="price-sale-label">Sale</span>';
    } else {
        priceElement.textContent = product.price.toFixed(2) + " NOK";
    }
}

function productCategory(product) {
    return product.gender || product.tags?.[0] || "Jacket";
}

function createLoadingIndicator(message) {
    const indicator = document.createElement("p");
    indicator.className = "loading-indicator";
    indicator.setAttribute("role", "status");
    indicator.setAttribute("aria-live", "polite");

    const spinner = document.createElement("span");
    spinner.className = "loading-spinner";
    spinner.setAttribute("aria-hidden", "true");
    indicator.appendChild(spinner);
    indicator.appendChild(document.createTextNode(message));

    return indicator;
}

function updateCart() {
    if (!headerCartButton) {
        return;
    }

    const totalQuantity = getCart().reduce(function (total, item) {
        return total + item.quantity;
    }, 0);

    const cartCount = headerCartButton.querySelector(".cart-count");
    if (cartCount) {
        cartCount.textContent = String(totalQuantity);
    } else {
        headerCartButton.textContent = "Cart (" + totalQuantity + ")";
    }
}

function getCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        const cart = JSON.parse(savedCart || "[]");

        if (!Array.isArray(cart)) {
            throw new Error("Invalid cart data");
        }

        return cart.filter(function (item) {
            return item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                Number.isFinite(item.price) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0;
        });
    } catch (error) {
        console.error("Unable to fetch the saved cart:", error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Unable to save the cart:", error);
    }

    updateCart();
}

function addToCart(product, size = "") {
    const cart = getCart();
    const productId = String(product.id);
    const existingItem = cart.find(function (item) {
        return item.id === productId && (item.size || "") === size;
    });

    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.description = product.description || existingItem.title;
    } else {
        cart.push({
            id: productId,
            title: product.title,
            description: product.description || product.title,
            price: productPrice(product),
            image: product.image.url,
            imageAlt: product.image.alt || product.title,
            size: size,
            quantity: 1
        });
    }
 
    saveCart(cart);
}

function createCartItem(item, showControls) {
    const row = document.createElement("product");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.imageAlt;
    row.append(image);

    const information = document.createElement("info");
    information.className = "cart-item-info";

    const title = document.createElement("h2");
    title.textContent = item.title;
    information.append(title);

    const price = document.createElement("p");
    price.className = "cart-item-price";
    price.textContent = `${item.price.toFixed(2)} NOK each`;
    information.append(price);

    if (item.size) {
        const size = document.createElement("p");
        size.className = "cart-item-size";
        size.textContent = "Size: " + item.size;
        information.append(size);
    }

    if (showControls) {
        const controls = document.createElement("quant");
        controls.className = "quantity-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute("aria-label", "Decrease quantity");
        decreaseButton.dataset.cartAction = "decrease";
        decreaseButton.dataset.productId = item.id;
        decreaseButton.dataset.cartSize = item.size || "";

        const quantity = document.createElement("span");
        quantity.textContent = String(item.quantity);
        quantity.setAttribute("aria-label", "Quantity");

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute("aria-label", "Increase quantity");
        increaseButton.dataset.cartAction = "increase";
        increaseButton.dataset.productId = item.id;
        increaseButton.dataset.cartSize = item.size || "";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-cart-item";
        removeButton.textContent = "Remove";
        removeButton.dataset.cartAction = "remove";
        removeButton.dataset.productId = item.id;
        removeButton.dataset.cartSize = item.size || "";

        controls.append(decreaseButton, quantity, increaseButton, removeButton);
        information.append(controls);
    } else {
        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + item.quantity;
        information.appendChild(quantity);
    }

    const total = document.createElement("strong");
    total.className = "cart-item-total";
    total.textContent = (item.price * item.quantity).toFixed(2) + " NOK";

    row.append(information, total);
    return row;
}

function createOrderSummaryItem(item) {
    const row = document.createElement("article");
    row.className = "order-summary-item";

    const imageFrame = document.createElement("div");
    imageFrame.className = "order-summary-image-frame";

    const image = document.createElement("img");
    image.className = "order-summary-image";
    image.src = item.image;
    image.alt = item.imageAlt || item.description || item.title;
    imageFrame.appendChild(image);
    row.appendChild(imageFrame);

    const content = document.createElement("div");
    content.className = "order-summary-content";

    const description = document.createElement("p");
    description.className = "order-summary-description";
    description.textContent = item.description || item.title;
    content.appendChild(description);

    const details = document.createElement("div");
    details.className = "order-summary-details";

    const size = document.createElement("p");
    size.className = "order-summary-detail";
    size.textContent = "Size: " + (item.size || "Not selected");
    details.appendChild(size);

    const quantity = document.createElement("p");
    quantity.className = "order-summary-detail";
    quantity.textContent = "Quantity: " + item.quantity;
    details.appendChild(quantity);
    content.appendChild(details);

    const pricing = document.createElement("div");
    pricing.className = "order-summary-pricing";

    const unitPrice = document.createElement("p");
    unitPrice.className = "order-summary-price";
    unitPrice.textContent = "Unit price: " + item.price.toFixed(2) + " NOK";
    pricing.appendChild(unitPrice);

    const lineTotal = document.createElement("strong");
    lineTotal.className = "order-summary-line-total";
    lineTotal.textContent =
        "Total: " + (item.price * item.quantity).toFixed(2) + " NOK";
    pricing.appendChild(lineTotal);
    content.appendChild(pricing);
    row.appendChild(content);

    return row;
}

document.addEventListener("DOMContentLoaded", function () {
    updateCart();
    renderCart();
    renderCheckout();
    loadProducts();
});
