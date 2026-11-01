const productDetails = document.getElementById("product-details");
const imageDetails = document.getElementById("details-image");
const categoryDetails = document.getElementById("details-category");
const nameDetails = document.getElementById("details-name");
const priceDetails = document.getElementById("details-price");
const descriptionDetails = document.getElementById("details-description");
const sizeSelect = document.getElementById("product-size");
const cartButton = document.querySelector("#product-details .add-cart-btn");

function showDetailsMessage(indicator, message, isError) {
    indicator.classList.toggle("loading-error", isError);
    const spinner = indicator.querySelector(".loading-spinner");

    if (spinner) {
        spinner.remove();
    }

    indicator.textContent = message;
}

async function loadProductDetails() {
    if (!productDetails) {
        return;
    }

    const detailsCard = productDetails.querySelector(".product-details-card");
    const loadingIndicator = createLoadingIndicator("Loading product details...");
    detailsCard.hidden = true;
    productDetails.setAttribute("aria-busy", "true");
    productDetails.insertBefore(loadingIndicator, detailsCard);

    const productId = new URLSearchParams(window.location.search).get("id");
    if (!productId) {
        showDetailsMessage(
            loadingIndicator,
            "No product was selected. choose a product from the products page.",
            true
        );
        productDetails.setAttribute("aria-busy", "false");
        return;
    }

    try {
        const response = await fetch("https://v2.api.noroff.dev/rainy-days");
        if (!response.ok) {
            throw new Error("Error fetching product details");
        }

        const payload = await response.json();
        if (!Array.isArray(payload.data)) {
            throw new Error("Invalid product data");
        }

        const product = payload.data.find(function (item) {
            return String(item.id) === productId;
        });

        if (!product) {
            showDetailsMessage(
                loadingIndicator,
                "Product not found. choose a product from the products page.",
                true
            );
            return;
        }

        imageDetails.src = product.image.url;
        imageDetails.alt = product.image.alt || product.title;
        categoryDetails.textContent = productCategory(product);
        nameDetails.textContent = product.title;
        renderProductPrice(priceDetails, product);
        descriptionDetails.textContent = product.description;
        cartButton.dataset.productId = product.id;

        const sizes = Array.isArray(product.sizes)
            ? product.sizes.filter(function (size) {
                return typeof size === "string" && size.trim();
            })
            : [];
        sizeSelect.replaceChildren(new Option("Select a size", ""));
        sizes.forEach(function (size) {
            sizeSelect.add(new Option(size, size));
        });
        sizeSelect.disabled = sizes.length === 0;
        cartButton.disabled = sizes.length === 0;

        if (sizes.length === 0) {
            const unavailableMessage = document.createElement("option");
            unavailableMessage.textContent = "No sizes available";
            unavailableMessage.disabled = true;
            sizeSelect.add(unavailableMessage);
        }

        cartButton.addEventListener("click", function () {
            if (!sizeSelect.value) {
                sizeSelect.reportValidity();
                return;
            }

            addToCart(product, sizeSelect.value);
            cartButton.textContent = "Added to Cart";

            window.setTimeout(function () {
                cartButton.textContent = "Add to Cart";
            }, 1200);
        });

        loadingIndicator.remove();
        detailsCard.hidden = false;
    } catch (error) {
        console.error("Unable to load product details:", error);
        showDetailsMessage(
            loadingIndicator,
            "Unable to load product details. Please try again later.",
            true
        );
    } finally {
        productDetails.setAttribute("aria-busy", "false");
    }
}

document.addEventListener("DOMContentLoaded", loadProductDetails);
