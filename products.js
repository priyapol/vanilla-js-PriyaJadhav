const productContainer = document.getElementById("product-container") ||
    document.querySelector(".jackets-grid, .products-grid");
const searchInput = document.getElementById("product-search") ||
    document.querySelector(".search input");
const isFeaturedGrid = Boolean(
    productContainer?.matches(".jackets-grid")
);
const featuredTitle = document.querySelector(".featured-header h1 span");
const featuredSubtitle = document.querySelector(".featured-header p");
const catalogTitle = document.querySelector(".products-header h1");
const catalogSubtitle = document.querySelector(".products-header p");
const selectedGender = new URLSearchParams(window.location.search)
    .get("gender")?.trim().toLowerCase() || "";
let showAllProducts = Boolean(selectedGender);

function updateProductsHeading(showAll = showAllProducts) {
    if (selectedGender) {
        const collectionName = selectedGender === "male"
            ? "Men's Collection"
            : selectedGender === "female"
                ? "Women's Collection"
                : "Jacket Collection";

        if (featuredTitle) {
            featuredTitle.textContent = collectionName;
        }

        if (catalogTitle) {
            catalogTitle.textContent = collectionName;
        }

        if (featuredSubtitle) {
            featuredSubtitle.textContent = "Browse all jackets in this collection";
        }

        if (catalogSubtitle) {
            catalogSubtitle.textContent = "Browse all jackets in this collection";
        }

        return;
    }

    if (showAll) {
        if (featuredTitle) {
            featuredTitle.textContent = "All Products";
        }

        if (featuredSubtitle) {
            featuredSubtitle.textContent = "Browse our full collection";
        }

        if (catalogTitle) {
            catalogTitle.textContent = "All Jackets";
        }

        if (catalogSubtitle) {
            catalogSubtitle.textContent = "Explore the full Rainy Days collection.";
        }
    }
}

updateProductsHeading();

function getVisibleProducts(searchValue) {
    const search = searchValue.trim().toLowerCase();

    return products.filter(function (product) {
        const title = typeof product.title === "string"
            ? product.title.toLowerCase()
            : "";
        const description = typeof product.description === "string"
            ? product.description.toLowerCase()
            : "";
        const gender = typeof product.gender === "string"
            ? product.gender.trim().toLowerCase()
            : "";

        const matchesGender = !selectedGender || gender === selectedGender;
        const genderSearch = search === "male" || search === "female";
        const matchesSearch = title.includes(search) ||
            description.includes(search) ||
            (genderSearch ? gender === search : gender.includes(search));

        return matchesGender && (!search || matchesSearch);
    });
}

function renderProducts(productList) {
    if (!productContainer) {
        return;
    }

    productContainer.innerHTML = "";

    if (!Array.isArray(productList) || productList.length === 0) {
        productContainer.textContent = "No products found.";
        return;
    }

    const shouldShowAll = showAllProducts || Boolean(searchInput?.value.trim());
    const visibleProducts = isFeaturedGrid && !shouldShowAll
        ? productList.slice(0, 4)
        : productList;

    visibleProducts.forEach(function (product) {
        if (isFeaturedGrid) {
            const card = document.createElement("article");
            card.className = "jacket-card";
            const productUrl = "view-product.html?id=" + encodeURIComponent(product.id);

            const link = document.createElement("a");
            link.className = "product-image-link";
            link.href = productUrl;
            link.setAttribute("aria-label", "View " + product.title);

            const image = document.createElement("img");
            image.src = product.image.url;
            image.alt = product.image.alt || product.title;
            link.appendChild(image);

            const title = document.createElement("h3");
            const titleLink = document.createElement("a");
            titleLink.href = productUrl;
            titleLink.textContent = product.title;
            title.appendChild(titleLink);

            const price = document.createElement("span");
            price.className = "price";
            renderProductPrice(price, product);

            const viewMoreLink = document.createElement("a");
            viewMoreLink.className = "view-more-btn";
            viewMoreLink.href = productUrl;
            viewMoreLink.textContent = "View More";

            card.append(link, title, price, viewMoreLink);
            productContainer.appendChild(card);
            return;
        }

        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.productId = product.id;
        card.tabIndex = 0;

        const category = document.createElement("span");
        category.className = "category-gender";
        category.textContent = productCategory(product);

        const image = document.createElement("img");
        image.src = product.image.url;
        image.alt = product.image.alt || product.title;

        const info = document.createElement("div");
        info.className = "card-info";

        const title = document.createElement("h2");
        title.textContent = product.title;

        const price = document.createElement("p");
        price.className = "price";
        renderProductPrice(price, product);

        const viewMoreLink = document.createElement("a");
        viewMoreLink.className = "view-more-btn";
        viewMoreLink.href = "view-product.html?id=" +
            encodeURIComponent(product.id);
        viewMoreLink.textContent = "View More";

        info.append(title, price, viewMoreLink);
        card.append(category, image, info);

        productContainer.appendChild(card);
    });
}


async function loadProducts() {
    if (!productContainer) {
        return;
    }

    productContainer.replaceChildren(
        createLoadingIndicator("Loading products...")
    );
    productContainer.setAttribute("aria-busy", "true");

    try {
        const response = await fetch(
            "https://v2.api.noroff.dev/rainy-days"
        );

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        const data = await response.json();

        if (!Array.isArray(data.data)) {
            throw new Error("Invalid product data");
        }

        products = data.data;

        renderProducts(getVisibleProducts(searchInput?.value || ""));

    } catch (error) {
        console.error("Error loading products:", error);
        productContainer.textContent =
            "Unable to load products. Please try again later.";
    } finally {
        productContainer.setAttribute("aria-busy", "false");
    }
}


if (searchInput) {
    searchInput.addEventListener("input", function () {
        renderProducts(getVisibleProducts(searchInput.value));
    });
}

if (productContainer) {
    productContainer.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
            return;
        }

        const card = event.target.closest(".product-card");

        if (card) {
            window.location.href = "view-product.html?id=" +
                encodeURIComponent(card.dataset.productId);
        }
    });


    productContainer.addEventListener("keydown", function (event) {
        if (
            (event.key === "Enter" || event.key === " ") &&
            event.target.matches(".product-card")
        ) {
            event.preventDefault();

            window.location.href = "view-product.html?id=" +
                encodeURIComponent(event.target.dataset.productId);
        }
    });
}
