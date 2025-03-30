let selectedSize = 'md';
let price = 449;

function selectSize(size) {
    selectedSize = size;
    
    // Update the active class for the size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.size-btn[data-size="${size}"]`).classList.add('active');
    
    // Update the price based on the selected size
    switch(size) {
        case 'xs':
            price = 299;
            break;
        case 'sm':
            price = 389;
            break;
        case 'md':
            price = 449;
            break;
        case 'lg':
            price = 549;
            break;
        case 'xl':
            price = 699;
            break;
    }
    
    // Update price display
    const priceElement = document.getElementById('price');
    if (priceElement) {
        priceElement.textContent = `$${price}.00`;
    }
    
    // Store selected size in localStorage for the receipt page
    localStorage.setItem('selectedSize', size);
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewContainer = document.getElementById('preview-container');
            const previewImage = document.getElementById('preview-image');
            const fileName = document.getElementById('file-name');
            
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            fileName.textContent = file.name;
        }
        reader.readAsDataURL(file);
    }
}

// Stripe integration and form submission handling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Stripe with your publishable key
    // This is a test key - replace with your actual Stripe publishable key in production
    const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
    
    const orderForm = document.querySelector('.order-section');
    
    if (orderForm) {
        const checkoutBtn = document.getElementById('checkout-button');
        
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const petName = document.getElementById('pet-name').value;
            const specialRequests = document.getElementById('special-requests').value;
            
            // Check if required fields are filled
            if (!name || !email || !petName) {
                alert('Please fill out all required fields.');
                return;
            }
            
            // Check if a size is selected
            const selectedSize = document.querySelector('.size-option.selected');
            if (!selectedSize) {
                alert('Please select a portrait size.');
                return;
            }
            
            // Check if an image was uploaded
            const preview = document.getElementById('preview-container');
            if (preview.style.display !== 'block') {
                alert('Please upload a photo of your pet.');
                return;
            }
            
            // Prepare the order data
            const orderData = {
                name,
                email,
                petName,
                specialRequests,
                size: selectedSize.getAttribute('data-size'),
                price: getPriceFromSize(selectedSize.getAttribute('data-size'))
            };
            
            // In a real implementation, you would send this data to your server
            // to create a Stripe Checkout Session and get a session ID
            // For demonstration purposes, we'll simulate this process
            
            // Normally, you would make an AJAX call to your server like this:
            fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            })
            .then(response => response.json())
            .then(session => {
                // Redirect to Stripe Checkout
                return stripe.redirectToCheckout({ sessionId: session.id });
            })
            .then(result => {
                if (result.error) {
                    alert(result.error.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error processing your payment. Please try again later.');
            });
            
            // For demo purposes, since we don't have a server yet:
            alert('In a live implementation, this would redirect to Stripe Checkout. Your order details have been collected and are ready to be processed securely.');
            console.log('Order data that would be sent to Stripe:', orderData);
        });
    }
});

// Helper function to get price from selected size
function getPriceFromSize(size) {
    switch(size) {
        case 'xs':
            return 29900; // $299.00 in cents for Stripe
        case 'sm':
            return 38900; // $389.00 in cents for Stripe
        case 'md':
            return 44900; // $449.00 in cents for Stripe
        case 'lg':
            return 54900; // $549.00 in cents for Stripe
        case 'xl':
            return 69900; // $699.00 in cents for Stripe
        default:
            return 0;
    }
}

// Commission Form Submission Handler
document.addEventListener('DOMContentLoaded', function() {
    const commissionForm = document.getElementById('commissionForm');
    
    if (commissionForm) {
        commissionForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show loading state
            const submitButton = document.querySelector('#commissionForm button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Get form data
            const formData = new FormData(commissionForm);
            const customerName = formData.get('name');
            const customerEmail = formData.get('email');
            const petName = formData.get('petName');
            const specialRequests = formData.get('specialRequests') || 'None';
            
            // Create payment intent
            fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    size: selectedSize,
                    price: price,
                    name: customerName,
                    email: customerEmail,
                    petName: petName,
                    specialRequests: specialRequests
                }),
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(function(data) {
                // Handle the result
                if (data.error) {
                    showError(data.error.message);
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                } else {
                    // Initialize Stripe
                    const stripe = Stripe('pk_test_51OTsGyCG6mXANvrHRvxPl25SIFtxYftk9fK9PwKJl2jZcP3iXUJhLgWIUnMfFcDWrBvZ01TKugXemZXkMIoQBWcA003J3VTVOe');
                    
                    // Confirm the payment with Stripe.js
                    stripe.confirmCardPayment(data.clientSecret, {
                        payment_method: {
                            card: elements.getElement('card'),
                            billing_details: {
                                name: customerName,
                                email: customerEmail
                            }
                        }
                    })
                    .then(function(result) {
                        if (result.error) {
                            // Show error to customer
                            showError(result.error.message);
                            submitButton.disabled = false;
                            submitButton.innerHTML = originalButtonText;
                        } else {
                            // Payment authorization succeeded, redirect to success page
                            window.location.href = `/success.html?payment_intent_id=${result.paymentIntent.id}`;
                        }
                    });
                }
            })
            .catch(function(error) {
                console.error('Error:', error);
                showError("There was an error processing your request. Please try again later.");
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            });
        });
    }
    
    // Initialize Stripe elements if we're on the commission form page
    if (document.getElementById('card-element')) {
        // Initialize Stripe
        const stripe = Stripe('pk_test_51OTsGyCG6mXANvrHRvxPl25SIFtxYftk9fK9PwKJl2jZcP3iXUJhLgWIUnMfFcDWrBvZ01TKugXemZXkMIoQBWcA003J3VTVOe');
        const elements = stripe.elements();
        
        // Create card Element and mount it
        const cardElement = elements.create('card', {
            style: {
                base: {
                    color: '#32325d',
                    fontFamily: '"Montserrat", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });
        
        cardElement.mount('#card-element');
        
        // Handle real-time validation errors
        cardElement.on('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
        // Make elements available globally in this context
        window.elements = elements;
    }
});

function showError(message) {
    const errorElement = document.getElementById('payment-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Scroll to error message
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert(message);
    }
} 