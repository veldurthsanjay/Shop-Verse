document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    updateCartCount(); 
});

function limitDescription(title, wordLimit = 40) {
    const words = title.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...'; 
    }
    return title; 
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-container');
    const orderSummaryContainer = document.getElementById('order-summary');
    cartContainer.innerHTML = ''; 

    if (cart.length === 0) {
        cartContainer.innerHTML = `
        <div class="empty-cart">
            <h2>Your Cart is Empty</h2>
            <a href="./product_page.html"><i class="fa-sharp fa-solid fa-arrow-left"></i>Continue Shopping</a>
        </div>`;
        orderSummaryContainer.innerHTML = ''; 
        cartContainer.style.boxShadow = 'none';
        orderSummaryContainer.style.boxShadow = 'none';
        return;
    }

    cartContainer.style.boxShadow = '';
    orderSummaryContainer.style.boxShadow = '';
    const heading = document.createElement('h2');
    heading.textContent = 'Item List';
    heading.classList.add('cart-heading');
    cartContainer.appendChild(heading);
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-details">
                <img src="${item.image}" alt="${limitDescription(item.title, 10)}" class="cart-item-image"> 
                <div class="cart-item-info">
                    <h4>${limitDescription(item.title)}</h4> 
                    <div class="cart-item-total">
                        <p> ${item.quantity} × $${(item.price).toFixed(2)}</p> 
                    </div>
                </div>
                <div class="quantity-control">
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <span id="quantity-${index}">${item.quantity}</span> 
                    <button onclick="increaseQuantity(${index})">+</button>
                </div>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    displayOrderSummary();
}
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));

    displayCart();
    updateCartCount();
}

function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').innerText = ` (${cart.length})`;
}
function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalProducts = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    const shippingCost = 30; 
    const totalAmount = (parseFloat(totalPrice) + shippingCost).toFixed(2);

    const orderSummaryContainer = document.getElementById('order-summary');
    orderSummaryContainer.innerHTML = ''; 

    if (cart.length === 0) {
        return; 
    }

    const heading = document.createElement("h2");
    heading.textContent = "Order Summary";
    orderSummaryContainer.appendChild(heading);

    const productsInfo = document.createElement("p");
    productsInfo.innerHTML = `Products (${totalProducts}) <span>$${totalPrice}</span>`;
    orderSummaryContainer.appendChild(productsInfo);

    const shippingInfo = document.createElement("p");
    shippingInfo.innerHTML = `Shipping <span>$${shippingCost}</span>`;
    orderSummaryContainer.appendChild(shippingInfo);

    const totalAmountInfo = document.createElement("p");
    totalAmountInfo.innerHTML = `<strong>Total amount</strong> <strong>$${totalAmount}</strong>`;
    orderSummaryContainer.appendChild(totalAmountInfo);

    const checkoutButton = document.createElement("button");
    checkoutButton.textContent = "Go to checkout";
    checkoutButton.classList.add("checkout-button");
    orderSummaryContainer.appendChild(checkoutButton);
}
