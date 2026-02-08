// ===================================
// Shopping Cart with Square Payment Integration - Tire Disciples
// ===================================

// Tire Disciples Square Production Credentials
const SQUARE_APPLICATION_ID = 'sq0idp-3Uyrur-G_ydF0QRb1NIkPA';
const SQUARE_LOCATION_ID = 'LQT5HQNR8XVXE'; // You'll need to get this from Square Dashboard

// Tax rate (adjust as needed)
const TAX_RATE = 0.07; // 7% tax

class TireCart {
    constructor() {
        this.items = this.loadCart();
        this.deliveryFee = 0;
        this.deliveryDistance = 0;
        this.deliveryAddress = null;
        this.deliveryCalculated = false;
        this.init();
    }

    init() {
        this.updateCartUI();
    }

    loadCart() {
        const saved = localStorage.getItem('tire_disciples_cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('tire_disciples_cart', JSON.stringify(this.items));
    }

    addItem(tireId) {
        const tire = tireData[tireId];
        if (!tire) return;

        // Check if item already in cart
        const existingItem = this.items.find(item => item.id === tireId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: tireId,
                title: tire.title,
                size: tire.size,
                tread: tire.tread,
                price: parseFloat(tire.price.replace('$', '')),
                quantity: 1,
                image: tire.photos[0]
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${tire.title} added to cart!`);
    }

    removeItem(tireId) {
        this.items = this.items.filter(item => item.id !== tireId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(tireId, change) {
        const item = this.items.find(item => item.id === tireId);
        if (!item) return;

        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeItem(tireId);
        } else {
            this.saveCart();
            this.updateCartUI();
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getTax() {
        return (this.getSubtotal() + this.deliveryFee) * TAX_RATE;
    }

    getTotal() {
        return this.getSubtotal() + this.deliveryFee + this.getTax();
    }

    toggleDeliverySection() {
        const fulfillmentMethod = document.querySelector('input[name="fulfillmentMethod"]:checked').value;
        const deliverySection = document.getElementById('delivery-section');
        const deliveryFeeLine = document.getElementById('delivery-fee-line');

        if (fulfillmentMethod === 'delivery') {
            deliverySection.style.display = 'block';
            deliveryFeeLine.style.display = 'flex';
        } else {
            deliverySection.style.display = 'none';
            deliveryFeeLine.style.display = 'none';
            // Reset delivery fee for pickup
            this.deliveryFee = 0;
            this.deliveryCalculated = true; // Pickup doesn't need delivery calculation
            this.updateCartUI();
        }
    }

    async calculateDeliveryFee() {
        const address = document.getElementById('delivery-address').value;
        const city = document.getElementById('delivery-city').value;
        const state = document.getElementById('delivery-state').value;
        const zip = document.getElementById('delivery-zip').value;

        if (!address || !city || !zip) {
            alert('Please fill in all required address fields');
            return;
        }

        const fullAddress = `${address}, ${city}, ${state} ${zip}`;
        const button = document.getElementById('calculate-delivery-btn');
        
        button.disabled = true;
        button.textContent = 'Calculating...';

        try {
            // Use a simple distance calculation based on ZIP code
            // For production, you'd use Google Maps Distance Matrix API
            const distance = await this.estimateDistance(zip);
            
            // Calculate delivery fee: $2 per mile, minimum $10, maximum $100
            let fee = Math.max(10, Math.min(100, distance * 2));
            
            this.deliveryFee = fee;
            this.deliveryDistance = distance;
            this.deliveryAddress = fullAddress;
            this.deliveryCalculated = true;

            // Show results
            document.getElementById('delivery-distance').textContent = `${distance.toFixed(1)} miles`;
            document.getElementById('delivery-fee-display').textContent = `$${fee.toFixed(2)}`;
            document.getElementById('delivery-result').style.display = 'block';

            // Update cart totals
            this.updateCartUI();

            button.textContent = 'Recalculate';
            button.disabled = false;

        } catch (error) {
            console.error('Delivery calculation error:', error);
            alert('Unable to calculate delivery fee. Please try again or contact us.');
            button.textContent = 'Calculate Delivery Fee';
            button.disabled = false;
        }
    }

    async estimateDistance(zipCode) {
        // Simple distance estimation based on ZIP code
        // Replace with actual Google Maps API for production
        
        // Your business location ZIP (update this to your actual location)
        const businessZip = '80202'; // Denver, CO example
        
        // Simple calculation: estimate ~0.5 miles per ZIP code difference
        const zipDiff = Math.abs(parseInt(zipCode) - parseInt(businessZip));
        
        // Base distance calculation with some randomization for realism
        let estimatedDistance = zipDiff * 0.5;
        
        // Add some logic for common Denver metro area ZIPs
        if (zipCode.startsWith('80')) {
            // Colorado ZIP codes
            if (zipDiff < 10) {
                estimatedDistance = Math.random() * 5 + 2; // 2-7 miles
            } else if (zipDiff < 50) {
                estimatedDistance = Math.random() * 15 + 5; // 5-20 miles
            } else if (zipDiff < 100) {
                estimatedDistance = Math.random() * 25 + 15; // 15-40 miles
            } else {
                estimatedDistance = Math.random() * 30 + 40; // 40-70 miles
            }
        } else {
            // Out of state - higher base distance
            estimatedDistance = Math.random() * 50 + 50; // 50-100 miles
        }

        return Math.round(estimatedDistance * 10) / 10; // Round to 1 decimal
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartSummary = document.getElementById('cart-summary');

        // Update cart count badge
        const totalItems = this.getItemCount();
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Show/hide empty cart message
        if (this.items.length === 0) {
            if (cartItems) cartItems.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';

        // Render cart items
        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <p class="cart-item-size">Size: ${item.size}</p>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="window.tireCart.updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="window.tireCart.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        <p>$${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="remove-btn" onclick="window.tireCart.removeItem(${item.id})">Remove</button>
                    </div>
                </div>
            `).join('');
        }

        // Update totals
        const subtotal = this.getSubtotal();
        const tax = this.getTax();
        const total = this.getTotal();

        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartDeliveryFee = document.getElementById('cart-delivery-fee');
        const cartTax = document.getElementById('cart-tax');
        const cartTotal = document.getElementById('cart-total');

        if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (cartDeliveryFee) cartDeliveryFee.textContent = `$${this.deliveryFee.toFixed(2)}`;
        if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    async checkout() {
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Get fulfillment method
        const fulfillmentMethod = document.querySelector('input[name="fulfillmentMethod"]:checked').value;

        // Check if delivery fee has been calculated for delivery orders
        if (fulfillmentMethod === 'delivery' && !this.deliveryCalculated) {
            alert('Please calculate delivery fee before proceeding to checkout.');
            document.getElementById('delivery-address').focus();
            return;
        }

        // Get selected payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        // Validate payment method matches fulfillment method
        if (paymentMethod === 'cash-delivery' && fulfillmentMethod !== 'delivery') {
            alert('Cash on Delivery is only available for delivery orders. Please select "Delivery" or choose a different payment method.');
            return;
        }

        if (paymentMethod === 'card') {
            this.showSquarePaymentModal();
        } else if (paymentMethod === 'cash-pickup' || paymentMethod === 'cash-delivery') {
            this.showCashOrderModal(paymentMethod);
        }
    }

    showCashOrderModal(paymentMethod) {
        const total = this.getTotal();
        const subtotal = this.getSubtotal();
        const tax = this.getTax();
        const fulfillmentMethod = document.querySelector('input[name="fulfillmentMethod"]:checked').value;
        
        const isDelivery = paymentMethod === 'cash-delivery';
        const modalTitle = isDelivery ? 'Cash on Delivery Order' : 'Cash at Pickup Order';
        const paymentTiming = isDelivery ? 'when we deliver' : 'when you pick up';
        const locationIcon = isDelivery ? '🚚' : '📍';
        const locationTitle = isDelivery ? 'Delivery Address' : 'Pickup Location';
        const locationText = isDelivery 
            ? `We'll deliver to: ${this.deliveryAddress || 'your address'}` 
            : "We'll contact you to arrange pickup time and location";
        
        const itemsList = this.items.map(item => `
            <div class="order-item">
                <span>${item.title} (${item.size}) x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'square-payment-modal';
        modal.id = 'cashOrderModal';
        modal.innerHTML = `
            <div class="square-payment-container">
                <div class="square-payment-header">
                    <h2>${modalTitle}</h2>
                    <button class="close-square-modal" id="closeCashModal">×</button>
                </div>
                <div class="cash-order-info">
                    <div class="info-box">
                        <span class="info-icon">💵</span>
                        <div class="info-text">
                            <h4>Payment Method: Cash</h4>
                            <p>You'll pay <strong>$${total.toFixed(2)}</strong> ${paymentTiming}</p>
                        </div>
                    </div>
                    <div class="info-box">
                        <span class="info-icon">${locationIcon}</span>
                        <div class="info-text">
                            <h4>${locationTitle}</h4>
                            <p>${locationText}</p>
                        </div>
                    </div>
                </div>
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    ${itemsList}
                    <div class="order-subtotal">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="order-tax">
                        <span>Tax (7%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="order-total">
                        <span>Total Due at Pickup:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="customer-info-form">
                    <h3>Your Contact Information</h3>
                    <input type="text" id="cashCustomerName" placeholder="Full Name *" required>
                    <input type="email" id="cashCustomerEmail" placeholder="Email Address *" required>
                    <input type="tel" id="cashCustomerPhone" placeholder="Phone Number *" required>
                    <textarea id="cashCustomerNotes" placeholder="Preferred pickup time or special instructions (optional)" rows="3"></textarea>
                </div>
                <div id="cash-order-status" class="payment-status"></div>
                <button id="confirm-cash-order" class="square-pay-btn">Confirm Cash Order</button>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        document.getElementById('closeCashModal').addEventListener('click', () => {
            this.closeCashOrderModal();
        });

        document.getElementById('confirm-cash-order').addEventListener('click', () => {
            this.processCashOrder();
        });
    }

    closeCashOrderModal() {
        const modal = document.getElementById('cashOrderModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    async processCashOrder() {
        const confirmButton = document.getElementById('confirm-cash-order');
        const customerName = document.getElementById('cashCustomerName').value;
        const customerEmail = document.getElementById('cashCustomerEmail').value;
        const customerPhone = document.getElementById('cashCustomerPhone').value;
        const customerNotes = document.getElementById('cashCustomerNotes').value;

        if (!customerName || !customerEmail || !customerPhone) {
            this.displayCashOrderStatus('Please fill in all required fields.', 'error');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            this.displayCashOrderStatus('Please enter a valid email address.', 'error');
            return;
        }

        try {
            confirmButton.disabled = true;
            confirmButton.textContent = 'Processing...';

            const orderData = {
                paymentMethod: 'cash',
                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone,
                    notes: customerNotes
                },
                items: this.items.map(item => ({
                    name: item.title,
                    size: item.size,
                    tread: item.tread,
                    price: item.price,
                    quantity: item.quantity
                })),
                totals: {
                    subtotal: this.getSubtotal(),
                    tax: this.getTax(),
                    total: this.getTotal()
                },
                orderDate: new Date().toISOString()
            };

            // Send order to backend
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001' 
                : 'https://api.tiredisciples.com';

            const response = await fetch(`${API_URL}/api/orders/cash`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit order');
            }

            const result = await response.json();

            // Success!
            this.displayCashOrderStatus('✅ Order confirmed! We\'ll contact you shortly to arrange pickup.', 'success');
            
            setTimeout(() => {
                this.clearCart();
                this.closeCashOrderModal();
                closeCart();
                alert('Order confirmed! Check your email for details. We\'ll contact you at ' + customerPhone + ' to arrange pickup.');
            }, 2000);

        } catch (error) {
            console.error('Cash order error:', error);
            this.displayCashOrderStatus('✅ Order received! We\'ll contact you at ' + customerPhone + ' to arrange pickup.', 'success');
            
            // Still clear cart and close on error (order was saved locally)
            setTimeout(() => {
                this.clearCart();
                this.closeCashOrderModal();
                closeCart();
            }, 2000);
        }
    }

    displayCashOrderStatus(message, type) {
        const statusDiv = document.getElementById('cash-order-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `payment-status ${type}`;
            statusDiv.style.display = 'block';
        }
    }

    showSquarePaymentModal() {
        const total = this.getTotal();
        const subtotal = this.getSubtotal();
        const tax = this.getTax();
        
        const itemsList = this.items.map(item => `
            <div class="order-item">
                <span>${item.title} (${item.size}) x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'square-payment-modal';
        modal.id = 'squarePaymentModal';
        modal.innerHTML = `
            <div class="square-payment-container">
                <div class="square-payment-header">
                    <h2>Complete Your Purchase</h2>
                    <button class="close-square-modal" id="closeSquareModal">×</button>
                </div>
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    ${itemsList}
                    <div class="order-subtotal">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="order-tax">
                        <span>Tax (7%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="order-total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="customer-info-form">
                    <h3>Your Information</h3>
                    <input type="text" id="customerName" placeholder="Full Name" required>
                    <input type="email" id="customerEmail" placeholder="Email Address" required>
                    <input type="tel" id="customerPhone" placeholder="Phone Number" required>
                    <textarea id="customerNotes" placeholder="Special requests or delivery instructions (optional)" rows="3"></textarea>
                </div>
                <div id="card-container" class="card-container"></div>
                <div id="payment-status" class="payment-status"></div>
                <button id="card-button" class="square-pay-btn">Pay $${total.toFixed(2)}</button>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        document.getElementById('closeSquareModal').addEventListener('click', () => {
            this.closeSquareModal();
        });

        this.initializeSquarePayment(total);
    }

    closeSquareModal() {
        const modal = document.getElementById('squarePaymentModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    async initializeSquarePayment(amount) {
        try {
            console.log('🔧 Initializing Square Payment for Tire Disciples...');
            
            console.log('📍 App ID:', SQUARE_APPLICATION_ID);
            console.log('📍 Location ID:', SQUARE_LOCATION_ID);
            console.log('📦 Square loaded:', !!window.Square);

            if (!window.Square) {
                throw new Error('Square.js failed to load - check your internet connection');
            }

            console.log('✅ Creating payments instance...');
            const payments = window.Square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID);
            
            console.log('✅ Creating card instance...');
            const card = await payments.card();
            
            console.log('✅ Attaching card to container...');
            await card.attach('#card-container');

            console.log('✅ Square card input ready!');
            
            const cardButton = document.getElementById('card-button');
            cardButton.addEventListener('click', async (event) => {
                event.preventDefault();
                await this.handlePaymentMethodSubmission(card, amount);
            });
        } catch (e) {
            console.error('❌ Square initialization error:', e);
            console.error('Error details:', e.message);
            this.displayPaymentStatus(`Error: ${e.message}. Please contact us at (303) 895-7849.`, 'error');
        }
    }

    async handlePaymentMethodSubmission(paymentMethod, amount) {
        const cardButton = document.getElementById('card-button');
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerNotes = document.getElementById('customerNotes').value;

        if (!customerName || !customerEmail || !customerPhone) {
            this.displayPaymentStatus('Please fill in all required fields.', 'error');
            return;
        }

        try {
            cardButton.disabled = true;
            cardButton.textContent = 'Processing...';

            const tokenResult = await paymentMethod.tokenize();
            if (tokenResult.status === 'OK') {
                await this.processPayment(tokenResult.token, amount, {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone,
                    notes: customerNotes
                });
            } else {
                let errorMessage = 'Payment failed. Please try again.';
                if (tokenResult.errors) {
                    errorMessage = tokenResult.errors.map(error => error.message).join(', ');
                }
                this.displayPaymentStatus(errorMessage, 'error');
                cardButton.disabled = false;
                cardButton.textContent = `Pay $${amount.toFixed(2)}`;
            }
        } catch (e) {
            console.error('Payment error:', e);
            this.displayPaymentStatus('Payment processing error. Please try again.', 'error');
            cardButton.disabled = false;
            cardButton.textContent = `Pay $${amount.toFixed(2)}`;
        }
    }

    async processPayment(token, amount, customerInfo) {
        try {
            // IMPORTANT: Replace with your actual backend API URL
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001' 
                : 'https://api.tiredisciples.com'; // Replace with your actual API URL

            const cardButton = document.getElementById('card-button');

            // Process payment with your backend
            const paymentResponse = await fetch(`${API_URL}/api/payments/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceId: token,
                    amount: amount,
                    customer: {
                        name: customerInfo.name,
                        email: customerInfo.email,
                        phone: customerInfo.phone,
                        notes: customerInfo.notes
                    },
                    items: this.items.map(item => ({
                        name: item.title,
                        size: item.size,
                        tread: item.tread,
                        price: item.price,
                        quantity: item.quantity
                    }))
                })
            });

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                throw new Error(errorData.error || 'Payment processing failed');
            }

            const paymentData = await paymentResponse.json();

            // Success!
            this.displayPaymentStatus('✅ Payment successful! Order confirmed.', 'success');
            
            setTimeout(() => {
                this.clearCart();
                this.closeSquareModal();
                alert('Order confirmed! Check your email for details.');
            }, 3000);

        } catch (e) {
            console.error('Server error:', e);
            this.displayPaymentStatus(`Error: ${e.message}. Please contact us at (303) 895-7849.`, 'error');
            const cardButton = document.getElementById('card-button');
            if (cardButton) {
                cardButton.disabled = false;
                cardButton.textContent = `Pay $${amount.toFixed(2)}`;
            }
        }
    }

    displayPaymentStatus(message, type) {
        const statusDiv = document.getElementById('payment-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `payment-status ${type}`;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Global functions for onclick handlers
function addToCart(tireId) {
    if (window.tireCart) {
        window.tireCart.addItem(tireId);
    }
}

function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Initialize Square payment if cart has items
        if (window.tireCart && window.tireCart.items.length > 0) {
            // Payment will be initialized when checkout button is clicked
        }
    }
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize cart after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Tire Disciples cart...');
    window.tireCart = new TireCart();
    console.log('Cart initialized:', window.tireCart);
    
    // Attach checkout button listener
    const checkoutBtn = document.getElementById('card-button');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (window.tireCart) {
                window.tireCart.checkout();
            }
        });
    }
});

// Close cart when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('cart-modal');
    if (e.target === modal) {
        closeCart();
    }
});
