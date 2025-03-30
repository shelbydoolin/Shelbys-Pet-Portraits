const express = require('express');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc'); // Replace with your actual Stripe secret key
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Store pending orders (in a real app, this would be a database)
const pendingOrders = [];

// Middleware to parse JSON and serve static files
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// Create a nodemailer transporter
// Replace with your actual email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',  // e.g., 'gmail', 'outlook', etc.
  auth: {
    user: 'your-email@gmail.com', // replace with your email
    pass: 'your-app-password'     // replace with app password (NOT your regular password)
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create a payment intent with manual capture
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { size, name, email, petName, specialRequests, price } = req.body;
    
    // Create a payment intent with manual capture (capture_method: 'manual')
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price, // Price in cents
      currency: 'usd',
      capture_method: 'manual', // This is key - payment will be authorized but not captured until you explicitly do so
      payment_method_types: ['card'],
      metadata: {
        customer_name: name,
        customer_email: email,
        pet_name: petName,
        special_requests: specialRequests || '',
        size: size,
        order_date: new Date().toISOString()
      },
      description: `Pet Portrait Commission - ${petName} (${size})`,
    });

    // Store the order in our pending orders list
    const orderDetails = {
      id: paymentIntent.id,
      name,
      email,
      petName,
      size,
      price: price / 100, // Convert back to dollars for display
      specialRequests,
      date: new Date(),
      status: 'pending'
    };
    
    pendingOrders.push(orderDetails);
    
    // Send notification email to artist about new pending order
    const artistMailOptions = {
      from: 'your-email@gmail.com', // replace with your email
      to: 'hello@shelbypetportraits.com', // replace with the email where you want to receive order notifications
      subject: `New Commission Request: ${petName}`,
      html: `
        <h1>New Pet Portrait Commission Request</h1>
        <p>You have received a new commission request that requires your review.</p>
        <hr>
        <h2>Customer Information</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <h2>Order Details</h2>
        <p><strong>Pet Name:</strong> ${petName}</p>
        <p><strong>Portrait Size:</strong> ${size}</p>
        <p><strong>Price:</strong> $${price / 100}</p>
        <hr>
        <h2>Special Requests</h2>
        <p>${specialRequests || 'None'}</p>
        <hr>
        <p>To review this order, please go to your <a href="http://localhost:3000/admin.html">admin dashboard</a>.</p>
        <p>Remember: The customer's card has been authorized but <strong>not charged</strong>. You must accept the commission within 7 days or the authorization will expire.</p>
      `
    };
    
    transporter.sendMail(artistMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending artist email notification:', error);
      } else {
        console.log('Artist email notification sent:', info.response);
      }
    });
    
    // Send confirmation email to customer
    const customerMailOptions = {
      from: 'hello@shelbypetportraits.com', // replace with your email
      to: email,
      subject: 'Your Pet Portrait Commission Request - Pending Review',
      html: `
        <h1>Thank You for Your Commission Request!</h1>
        <p>Dear ${name},</p>
        <p>I've received your request to create a custom portrait of ${petName}. Your request is now pending review.</p>
        <p><strong>Important:</strong> Your card has been authorized but <strong>not charged</strong>. The payment will only be processed if I confirm that I can accept your commission.</p>
        <hr>
        <h2>Commission Details</h2>
        <p><strong>Pet Name:</strong> ${petName}</p>
        <p><strong>Portrait Size:</strong> ${size}</p>
        <p><strong>Price:</strong> $${price / 100}</p>
        <hr>
        <p>I'll review your request within 2-3 business days and notify you once I've made a decision. If I can accept your commission, your payment will be processed and I'll begin working on your artwork.</p>
        <p>If for any reason I cannot accept your commission at this time (due to high volume or other constraints), the authorization on your card will be released and you won't be charged.</p>
        <hr>
        <p>If you have any questions in the meantime, feel free to reply to this email.</p>
        <p>Warm regards,<br>Shelby</p>
      `
    };
    
    transporter.sendMail(customerMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending customer email notification:', error);
      } else {
        console.log('Customer email notification sent:', info.response);
      }
    });

    // Return the client secret to the frontend
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// API to get all pending orders (protected in a real app)
app.get('/api/pending-orders', (req, res) => {
  res.json(pendingOrders);
});

// API to accept an order (capture the payment)
app.post('/api/accept-order', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Find the order in our list
    const orderIndex = pendingOrders.findIndex(order => order.id === paymentIntentId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    
    // Update order status
    pendingOrders[orderIndex].status = 'accepted';
    
    // Send acceptance email to customer
    const order = pendingOrders[orderIndex];
    const acceptanceEmail = {
      from: 'hello@shelbypetportraits.com',
      to: order.email,
      subject: 'Good News! Your Pet Portrait Commission Has Been Accepted',
      html: `
        <h1>Your Commission Has Been Accepted!</h1>
        <p>Dear ${order.name},</p>
        <p>I'm delighted to inform you that I've accepted your commission request for a portrait of ${order.petName}!</p>
        <p>Your payment has now been processed and I'll be starting work on your portrait soon.</p>
        <hr>
        <h2>What Happens Next?</h2>
        <ol>
          <li>I'll review your photo in detail and begin planning your portrait</li>
          <li>Within a week, I'll send you a sketch for your approval</li>
          <li>After your approval, I'll begin the painting process (2-3 weeks)</li>
          <li>Once complete, I'll send a final image for your approval</li>
          <li>After your final approval, your portrait will be carefully packaged and shipped to you</li>
        </ol>
        <hr>
        <p>I'm excited to create this special keepsake of ${order.petName} for you!</p>
        <p>Warm regards,<br>Shelby</p>
      `
    };
    
    transporter.sendMail(acceptanceEmail);
    
    res.json({ success: true, message: 'Order accepted successfully' });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: error.message });
  }
});

// API to decline an order (cancel the payment intent)
app.post('/api/decline-order', async (req, res) => {
  try {
    const { paymentIntentId, reason } = req.body;
    
    // Find the order in our list
    const orderIndex = pendingOrders.findIndex(order => order.id === paymentIntentId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Cancel the payment intent
    await stripe.paymentIntents.cancel(paymentIntentId);
    
    // Update order status
    pendingOrders[orderIndex].status = 'declined';
    pendingOrders[orderIndex].declineReason = reason || 'Unable to accept at this time';
    
    // Send decline email to customer
    const order = pendingOrders[orderIndex];
    const declineEmail = {
      from: 'hello@shelbypetportraits.com',
      to: order.email,
      subject: 'Update on Your Pet Portrait Commission Request',
      html: `
        <h1>Commission Request Update</h1>
        <p>Dear ${order.name},</p>
        <p>Thank you for your interest in a custom portrait of ${order.petName}.</p>
        <p>After careful consideration, I regret to inform you that I'm unable to accept your commission at this time due to ${reason || 'high demand and limited availability'}.</p>
        <p>The authorization on your card has been released, and you <strong>will not be charged</strong>.</p>
        <hr>
        <p>I truly appreciate your interest in my artwork. If you'd like to try again in the future, please feel free to submit another request when my commission calendar opens up again.</p>
        <p>Warm regards,<br>Shelby</p>
      `
    };
    
    transporter.sendMail(declineEmail);
    
    res.json({ success: true, message: 'Order declined successfully' });
  } catch (error) {
    console.error('Error declining order:', error);
    res.status(500).json({ error: error.message });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('petPhoto'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Return the file path that can be associated with an order
        res.json({
            success: true,
            filePath: req.file.path,
            fileName: req.file.originalname
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to serve the admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Webhook to handle Stripe events
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      'whsec_your_webhook_signing_secret' // Replace with your webhook signing secret
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific events
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 