const CONFIRMATION_ORDER_STORAGE_KEY = "rainy-days-last-order";

try {
    const savedOrder = localStorage.getItem(CONFIRMATION_ORDER_STORAGE_KEY);
    if (savedOrder) {
        const order = JSON.parse(savedOrder);
        document.getElementById("confirmation-order-id").textContent = order.orderId;
        document.getElementById("confirmation-message").textContent =
            "We have received your order. It will be shipped in " +
            order.deliveryEstimate + ".";
    }
} catch (error) {
    console.error("Unable to load the order confirmation:", error);
}
