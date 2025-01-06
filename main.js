function limitedwords(str, n) {
    return str.split("").slice(0, n).join("") + "...";
}

let allProducts = []; 

fetch("https://fakestoreapi.com/products")
    .then((response) => response.json())
    .then((data) => {
        allProducts = data; 
        displayProducts(allProducts); 
    })
    .catch((error) => {
        console.log("Error:", error);
    });

function displayProducts(products) {
    const container = document.getElementById("container");
    const productHTML = products
        .map((product) => {
            const shorttitle = limitedwords(product.title, 11);
            const shortdescription = limitedwords(product.description, 70);
            return `
                <div class="productcard">
                    <img src="${product.image}" alt="Product Image">
                    <h3>${shorttitle}</h3>
                    <p>${shortdescription}</p>
                    <hr>
                    <p>$${product.price}</p>
                    <hr>
                    <button>Details</button>
                   <button onclick="addToCart(${product.id})">Add to Cart</button>
                </div>`;
        })
        .join("");
    container.innerHTML = productHTML;
}
function filterProducts(category) {
    const filteredProducts = allProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
    ); 
    displayProducts(filteredProducts); 
}

document.getElementById("categoriesbtns").addEventListener("click", (e) => {
    const category = e.target.id; 
    if (category === "all") {
        displayProducts(allProducts);
    } else if (category === "mens") {
        filterProducts("men's clothing");
    } else if (category === "women") {
        filterProducts("women's clothing");
    } else if (category === "jewelery") {
        filterProducts("jewelery");
    } else if (category === "electronics") {
        filterProducts("electronics");
    }
});
 

function addToCart(productId) {
    const product = allProducts.find(item => item.id === productId);

    if (!product) {
        return; 
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productInCart = cart.find(item => item.id === productId);

    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').innerText = ` (${cart.length})`;
}

document.addEventListener('DOMContentLoaded', updateCartCount);
