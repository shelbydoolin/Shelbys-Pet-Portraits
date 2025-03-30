document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    if (document.getElementById('admin-dashboard')) {
        loadOrders();
        
        // Set up event delegation for accept/decline buttons
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('accept-btn')) {
                acceptOrder(event.target.dataset.id);
            } else if (event.target.classList.contains('decline-btn')) {
                showDeclineModal(event.target.dataset.id);
            } else if (event.target.id === 'confirm-decline') {
                const orderId = document.getElementById('decline-modal').dataset.orderId;
                const reason = document.getElementById('decline-reason').value;
                declineOrder(orderId, reason);
            } else if (event.target.id === 'close-modal' || event.target.classList.contains('modal-backdrop')) {
                closeModal();
            }
        });
    }
});

// Load all orders from the server
function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '<p class="loading">Loading orders...</p>';
    
    fetch('/api/orders')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            return response.json();
        })
        .then(data => {
            updateStats(data);
            renderOrders(data);
        })
        .catch(error => {
            console.error('Error:', error);
            ordersList.innerHTML = `<p class="error">Error loading orders: ${error.message}</p>`;
        });
}

// Update the statistics based on order data
function updateStats(orders) {
    const pendingCount = orders.filter(order => order.status === 'pending').length;
    const acceptedCount = orders.filter(order => order.status === 'accepted').length;
    const declinedCount = orders.filter(order => order.status === 'declined').length;
    
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('accepted-count').textContent = acceptedCount;
    document.getElementById('declined-count').textContent = declinedCount;
    document.getElementById('total-count').textContent = orders.length;
}

// Render the orders in the UI
function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders found.</p>';
        return;
    }
    
    // Sort orders - pending first, then by date (newest first)
    orders.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const orderCard = document.createElement('div');
        orderCard.className = `order-card ${order.status}`;
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-id">${order.id}</div>
                <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
            </div>
            <div class="order-details">
                <div class="order-info">
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Customer:</strong> ${order.name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${order.email}">${order.email}</a></p>
                    <p><strong>Pet:</strong> ${order.petName}</p>
                    <p><strong>Size:</strong> ${getSizeLabel(order.size)}</p>
                    <p><strong>Price:</strong> $${order.price.toFixed(2)}</p>
                </div>
                <div class="order-notes">
                    <h4>Special Requests:</h4>
                    <p>${order.specialRequests || 'None'}</p>
                </div>
                ${order.status === 'pending' ? `
                <div class="order-actions">
                    <button class="accept-btn" data-id="${order.id}">Accept Order</button>
                    <button class="decline-btn" data-id="${order.id}">Decline Order</button>
                </div>
                ` : ''}
                ${order.status === 'declined' && order.declineReason ? `
                <div class="decline-reason">
                    <h4>Reason for Declining:</h4>
                    <p>${order.declineReason}</p>
                </div>
                ` : ''}
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    });
}

// Accept an order
function acceptOrder(orderId) {
    if (!confirm('Are you sure you want to accept this order? This will capture the payment.')) {
        return;
    }
    
    updateOrderStatus(orderId, 'accept');
}

// Show the decline modal
function showDeclineModal(orderId) {
    const modal = document.getElementById('decline-modal');
    modal.dataset.orderId = orderId;
    modal.style.display = 'block';
    document.getElementById('decline-reason').focus();
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('decline-modal');
    modal.style.display = 'none';
    document.getElementById('decline-reason').value = '';
}

// Decline an order with a reason
function declineOrder(orderId, reason) {
    if (!reason.trim()) {
        alert('Please provide a reason for declining.');
        return;
    }
    
    updateOrderStatus(orderId, 'decline', reason);
    closeModal();
}

// Update the order status (accept or decline)
function updateOrderStatus(orderId, action, reason = '') {
    const ordersList = document.getElementById('orders-list');
    ordersList.classList.add('loading');
    
    fetch(`/api/orders/${orderId}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update order');
            }
            return response.json();
        })
        .then(data => {
            // Reload orders to update the UI
            loadOrders();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        })
        .finally(() => {
            ordersList.classList.remove('loading');
        });
}

// Helper function to get a readable size label
function getSizeLabel(size) {
    switch(size) {
        case 'small':
            return 'Petite (8" x 10")';
        case 'medium':
            return 'Classic (11" x 14")';
        case 'large':
            return 'Grand (16" x 20")';
        default:
            return size;
    }
} 