# Shelby's Pet Portraits Website

This is a website for a fictional pet portrait artist named Shelby who creates custom hand-painted portraits of pets.

## Website Structure

The website consists of the following pages:

1. **Home Page (index.html)** - The main landing page with hero section, order section, about the artist, and testimonials.
2. **Commission Process Page (pages/commission-process.html)** - Detailed information about how the pet portrait commissioning process works.
3. **FAQs Page (pages/faqs.html)** - Frequently asked questions about pet portraits, shipping, etc.
4. **Gallery Page (pages/gallery.html)** - A showcase of previous pet portrait work.
5. **Contact Page (pages/contact.html)** - Contact form and other methods to get in touch.
6. **Success Page (success.html)** - Order confirmation page shown after a successful payment.

## File Structure

```
Shelby's Website/
├── css/
│   └── styles.css
├── images/
│   ├── hero-dog-portrait.jpg
│   ├── hero-cat-portrait.jpg
│   ├── hero-bulldog-portrait.jpg
│   ├── gallery-dog-portrait-1.jpg
│   ├── gallery-cat-portrait-1.jpg
│   ├── gallery-dog-portrait-2.jpg
│   ├── gallery-dog-portrait-3.jpg
│   ├── gallery-rabbit-portrait.jpg
│   ├── gallery-multiple-pets.jpg
├── js/
│   └── scripts.js
├── pages/
│   ├── commission-process.html
│   ├── faqs.html
│   ├── gallery.html
│   └── contact.html
├── index.html
├── success.html
├── server.js
├── package.json
└── README.md
```

## Setup Instructions

1. Clone or download this repository to your local machine.
2. Replace placeholder image files with actual images. The image file names should match the current placeholders.
3. Install Node.js dependencies:
   ```
   npm install
   ```
4. Set up your Stripe account:
   - Create an account at [stripe.com](https://stripe.com)
   - Get your API keys from the Stripe Dashboard
   - Update the following files with your Stripe keys:
     - `server.js`: Replace the test secret key
     - `js/scripts.js`: Replace the test publishable key

5. Start the server:
   ```
   npm start
   ```
   
6. Access the website at http://localhost:3000

## Stripe Payment Integration

This website includes a secure payment processing system using Stripe Checkout. Here's how it works:

1. When a customer fills out the commission form and clicks "Complete Your Commission," the form data is validated.
2. If all required information is provided, a request is sent to the server to create a Stripe Checkout session.
3. The customer is redirected to Stripe's secure checkout page to enter their payment information.
4. After successful payment, the customer is redirected to a success page with order confirmation details.
5. Stripe webhooks can be configured to notify your application when payment is completed, allowing you to trigger additional processes like sending confirmation emails.

### Stripe Integration Files

- `js/scripts.js` - Contains client-side code for validating the form and initiating the Stripe Checkout process
- `server.js` - Express server that creates Stripe Checkout sessions and handles webhooks
- `success.html` - Success page displayed after successful payment

### Customizing the Payment Process

To customize the payment process:

1. Update product details in `server.js` to match your specific offerings
2. Modify the success page to reflect your branding and post-purchase process
3. Implement additional backend logic for order processing, email notifications, etc.

## Features

- Responsive design that works on mobile, tablet, and desktop
- Contact form for inquiries
- Image gallery to showcase previous work
- Detailed commission process information
- FAQ section for common questions
- Secure payment processing with Stripe

## Technology Stack

- HTML5
- CSS3 (with CSS variables for theming)
- JavaScript (ES6)
- Node.js and Express for the server
- Stripe API for payment processing
- Font Awesome for icons
- Google Fonts for typography

## Notes for Future Development

- Add a database to store order information
- Implement user authentication for order tracking
- Create an admin panel for managing orders and gallery images
- Add email notification system for order updates

## License

This project is for demonstration purposes only.

## Contact

For any questions about this project, please contact hello@shelbypetportraits.com 