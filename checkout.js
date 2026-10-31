const checkoutItems = document.getElementById("checkout-items");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutForm = document.getElementById("checkout-form");
const checkoutConfirmation = document.getElementById("checkout-confirmation");
const checkoutDelivery = document.getElementById("checkout-delivery");
const checkoutTotal = document.getElementById("checkout-total");
const ORDER_STORAGE_KEY = "rainy-days-last-order";
const deliveryFees = {
    standard: 5.99,
    express: 12.99,
    pickup: 0
};

function selectedDeliveryFee() {
    const selectedMethod = checkoutForm?.querySelector(
        'input[name="delivery"]:checked'
    )?.value;

    return deliveryFees[selectedMethod] ?? deliveryFees.standard;
}

function updateCheckoutTotals(cart) {
    const subtotal = cart.reduce(function (total, item) {
        return total + item.price * item.quantity;
    }, 0);
    const deliveryFee = selectedDeliveryFee();

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent = subtotal.toFixed(2) + " NOK";
    }

    if (checkoutDelivery) {
        checkoutDelivery.textContent = deliveryFee === 0
            ? "Free"
            : deliveryFee.toFixed(2) + " NOK";
    }

    if (checkoutTotal) {
        checkoutTotal.textContent = (subtotal + deliveryFee).toFixed(2) + " NOK";
    }

    return { subtotal: subtotal, deliveryFee: deliveryFee };
}

function renderCheckout() {
    if (!checkoutItems) {
        return;
    }

    const cart = getCart();
    checkoutItems.innerHTML = "";

    cart.forEach(function (item) {
        checkoutItems.appendChild(createOrderSummaryItem(item));
    });

    updateCheckoutTotals(cart);

    if (cart.length === 0 && checkoutForm) {
        checkoutForm.hidden = true;

        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart-message";
        emptyMessage.textContent = "Your cart is empty. Add a product before checkout.";
        checkoutItems.appendChild(emptyMessage);
    }
}

if (checkoutForm) {
    checkoutForm.addEventListener("change", function (event) {
        if (event.target.matches('input[name="delivery"]')) {
            updateCheckoutTotals(getCart());
        }
    });
}

if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const cart = getCart();
        if (cart.length === 0) {
            renderCheckout();
            return;
        }

        const formData = new FormData(checkoutForm);
        const deliveryMethod = formData.get("delivery");
        const totals = updateCheckoutTotals(cart);
        const deliveryEstimate = {
            standard: "3-5 business days",
            express: "1-2 business days",
            pickup: "Ready for pickup"
        }[deliveryMethod] || "3-5 business days";
        const order = {
            orderId: "RD-" + Date.now().toString(36).toUpperCase(),
            deliveryEstimate: deliveryEstimate
        };

        try {
            localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
        } catch (error) {
            console.error("Unable to save the order confirmation:", error);
            checkoutConfirmation.hidden = false;
            checkoutConfirmation.textContent =
                "We could not save your order confirmation. Your cart has not been cleared. Please try again.";
            return;
        }

        checkoutForm.querySelectorAll("[data-demo-card-field]").forEach(function (input) {
            input.value = "";
        });
        saveCart([]);
        window.location.href = "order-confirmation.html";
    });
}
