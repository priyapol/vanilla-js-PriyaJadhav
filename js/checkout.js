const checkoutItems = document.getElementById("checkout-items");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutForm = document.getElementById("checkout-form");
const checkoutConfirmation = document.getElementById("checkout-confirmation");
const checkoutDelivery = document.getElementById("checkout-delivery");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutSubmit = document.getElementById("checkout-submit");
const ORDER_STORAGE_KEY = "rainy-days-last-order";
const deliveryMethods = {
    standard: {
        fee: 5.99,
        estimate: "3-5 business days"
    },
    pickup: {
        fee: 0,
        estimate: "Ready for pickup"
    }
};

function selectedDeliveryMethod() {
    const selectedMethod = checkoutForm?.querySelector(
        'input[name="delivery"]:checked'
    )?.value;

    return deliveryMethods[selectedMethod] ? selectedMethod : "standard";
}

function updateCheckoutTotals(cart) {
    const subtotal = cart.reduce(function (total, item) {
        return total + item.price * item.quantity;
    }, 0);
    const deliveryFee = deliveryMethods[selectedDeliveryMethod()].fee;

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
    checkoutSubmit.disabled = cart.length === 0;

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

        const deliveryMethod = selectedDeliveryMethod();
        updateCheckoutTotals(cart);
        const order = {
            orderId: "RD-" + Date.now().toString(36).toUpperCase(),
            deliveryEstimate: deliveryMethods[deliveryMethod].estimate
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

        saveCart([]);
        window.location.href = "confirmation/index.html";
    });
}
