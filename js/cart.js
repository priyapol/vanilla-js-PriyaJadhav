const cartItems = document.getElementById("cart-items");
const cartSummaryItems = document.getElementById("cart-summary-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartCheckoutLink = document.getElementById("checkout-link");

function renderCart() {
    if (!cartItems) {
        return;
    }

    const cart = getCart();
    cartItems.innerHTML = "";

    if (cartSummaryItems) {
        cartSummaryItems.replaceChildren();
        cart.forEach(function (item) {
            cartSummaryItems.appendChild(createOrderSummaryItem(item));
        });
    }

    if (cart.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart-message";
        emptyMessage.textContent = "Your cart is empty. Add a product to get started.";
        cartItems.appendChild(emptyMessage);

        if (cartCheckoutLink) {
            cartCheckoutLink.setAttribute("aria-disabled", "true");
            cartCheckoutLink.tabIndex = -1;
        }
    } else {
        cart.forEach(function (item) {
            cartItems.appendChild(createCartItem(item, true));
        });

        if (cartCheckoutLink) {
            cartCheckoutLink.removeAttribute("aria-disabled");
            cartCheckoutLink.tabIndex = 0;
        }
    }

    if (cartSubtotal) {
        const subtotal = cart.reduce(function (total, item) {
            return total + item.price * item.quantity;
        }, 0);
        cartSubtotal.textContent = subtotal.toFixed(2) + " NOK";
    }
}

if (cartItems) {
    cartItems.addEventListener("click", function (event) {
        const actionButton = event.target.closest("[data-cart-action]");
        if (!actionButton) {
            return;
        }

        const cart = getCart();
        const selectedItem = cart.find(function (item) {
            return item.id === actionButton.dataset.productId &&
                (item.size || "") === actionButton.dataset.cartSize;
        });

        if (!selectedItem) {
            return;
        }

        const action = actionButton.dataset.cartAction;
        if (action === "remove") {
            saveCart(cart.filter(function (item) {
                return item.id !== selectedItem.id ||
                    (item.size || "") !== (selectedItem.size || "");
            }));
            renderCart();
            return;
        }

        if (action === "increase") {
            selectedItem.quantity += 1;
        } else if (action === "decrease") {
            selectedItem.quantity -= 1;
        }

        saveCart(cart.filter(function (item) {
            return item.quantity > 0;
        }));
        renderCart();
    });
}

if (cartCheckoutLink) {
    cartCheckoutLink.addEventListener("click", function (event) {
        if (cartCheckoutLink.getAttribute("aria-disabled") === "true") {
            event.preventDefault();
        }
    });
}
