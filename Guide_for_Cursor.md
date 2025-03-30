# Shelby's Pet Portraits - Complete Website Guide

This guide provides a comprehensive breakdown of the "Shelby's Pet Portraits" website project, explains all features and functionality, and includes setup instructions for running a local test server.

## Project Overview

"Shelby's Pet Portraits" is a professional website for a custom pet portrait artist, featuring before/after gallery comparisons, a commission process, and a secure payment system using Stripe.

## Website Structure

### Key Pages:
1. **Home Page** (`index.html`) - Main landing page with:
   - Navigation header with links to all sections
   - Hero section showcasing featured portraits
   - Commission services and pricing
   - About the artist section
   - Customer testimonials
   - Gallery preview

2. **Gallery Page** (`pages/gallery.html`) - Showcases pet portraits with:
   - Interactive before/after slider comparing original photos with finished portraits
   - 6 comparison items (5 dogs and 1 cat)
   - Call-to-action for commissions

3. **Commission Page** (`pages/commission.html`) - For submitting orders with:
   - Detailed form for customer and pet information
   - Portrait size and pricing options
   - Reference photo upload capability
   - Secure payment integration with Stripe

4. **Commission Process** (`pages/commission-process.html`) - Explains the steps involved in commissioning a portrait

5. **FAQs Page** (`pages/faqs.html`) - Answers to common questions

6. **Contact Page** (`pages/contact.html`) - Contact form and information

7. **Success Page** (`success.html`) - Confirmation page after successful orders

8. **Admin Page** (`admin.html`) - Private dashboard for managing commissions

## Technical Implementation

### Frontend:
- **HTML5** structure with semantic elements
- **CSS3** for styling with responsive design
- **Vanilla JavaScript** for interactivity
- **Font Awesome** icons and **Google Fonts** for typography

### Backend:
- **Node.js** with **Express** server
- **Stripe API** integration for secure payments
- **Nodemailer** for email notifications
- **Multer** for file uploads

### Special Features:
1. **Before/After Gallery Sliders**: Interactive comparison between reference photos and finished portraits
2. **Two-Step Payment Process**: Card authorization followed by artist approval
3. **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
4. **Admin Dashboard**: Manage commissions and payments

## Setup Instructions

Copy and paste these instructions into your terminal to set up and run the website:

```bash
# 1. Make sure Node.js is installed (v14 or later recommended)
# Current project runs on Node.js v22.14.0

# 2. Install required dependencies
npm install

# 3. Configure environment variables for a production setup
# Create a .env file with the following variables:
cat > .env << EOF
STRIPE_SECRET_KEY=sk_test_4eC39HqLyjWDarjtT1zdp7dc
STRIPE_PUBLISHABLE_KEY=pk_test_TYooMQauvdEDq54NiTphI7jx
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF

# 4. Start the server
npm start
```

After running these commands, the server will start on port 3000. You can access the website by opening your browser and navigating to `http://localhost:3000`.

## Key Files & What They Do

### HTML Files:
- `index.html`: Main landing page
- `pages/gallery.html`: Gallery with before/after slider feature
- `pages/commission.html`: Commission form with Stripe integration
- `pages/commission-process.html`: Steps of the commission process
- `pages/faqs.html`: Frequently asked questions
- `pages/contact.html`: Contact information and form
- `success.html`: Order confirmation page
- `admin.html`: Admin dashboard for managing orders

### CSS:
- `css/styles.css`: Main stylesheet with responsive design

### JavaScript:
- `js/scripts.js`: Core functionality including navigation and gallery sliders
- Additional JS modules for form validation and payment processing

### Server:
- `server.js`: Express server handling:
  - Static file serving
  - Commission form processing
  - Stripe payment integration
  - Email notifications
  - File uploads for reference photos

## Gallery Before/After Feature

The gallery page features an innovative slider for comparing reference photos to finished portraits:

```
Reference Photos → Painted Portraits
-----------------------------------------
golden-photo.jpg → gallery-dog-portrait-1.jpg (Golden Retriever)
collie-photo.jpg → gallery-dog-portrait-2.jpg (Border Collie)
shepherd-photo.jpg → gallery-dog-portrait-3.jpg (German Shepherd)
tabby-photo.jpg → gallery-cat-portrait-1.jpg (Tabby Cat)
bulldog-photo.jpg → gallery-bulldog-portrait.jpg (Bulldog)
additional-dog-photo.jpg → gallery-dog-portrait-4.jpg (Additional Dog)
```

Key implementation details:
- Reference photos are stored in `images/reference-photos/`
- Finished portraits are stored in the main `images/` directory
- Interactive slider uses JavaScript to adjust the clip-path property
- CSS transitions for smooth sliding effects

## Commission and Payment Flow

The commission system works as follows:

1. Customer fills out the commission form with pet and portrait details
2. Customer submits reference photo(s) via file upload
3. Customer authorizes payment via Stripe (card is authorized but not charged)
4. Artist receives notification of new commission request
5. Artist reviews commission details and reference photos in admin dashboard
6. Artist accepts or declines the commission:
   - If accepted: payment is captured and confirmation email sent
   - If declined: payment authorization is canceled and notification sent

This two-step process protects both the artist and customer by ensuring the artist can evaluate if they can complete the commission before payment is finalized.

## Testing the Website

To thoroughly test all functionality:

1. **Navigation Test**: Click through all site navigation links
2. **Gallery Test**: Test the before/after sliders on the gallery page
3. **Commission Flow Test**:
   - Fill out the commission form
   - Upload test images
   - Use Stripe test cards (e.g., 4242 4242 4242 4242) for payment testing
4. **Responsive Design Test**: Check on different screen sizes
5. **Admin Dashboard Test**: Review order management functionality

## Recent Updates and Features

Recent improvements to the website include:

1. **Enhanced Gallery UI**: Improved before/after comparison sliders with:
   - Optimized image positioning for the golden retriever photo
   - Added a 6th comparison item (now 5 dogs + a cat)
   - Balanced image scaling with custom CSS adjustments
   
2. **Consistent Header Navigation**: Added across all pages with:
   - Modernized styling and responsive design
   - Clear active state indicators
   - Mobile-friendly navigation

3. **Improved Image Handling**: Better display of reference photos with:
   - Custom positioning for different pet types
   - Background color adjustments for cleaner presentation
   - Optimized object-fit properties for portrait/landscape photos

## Important Note for Testing

When testing the payment functionality, use Stripe's test card numbers:
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 9995` - Failed payment (insufficient funds)
- Expiry date: any future date
- CVC: any 3 digits
- ZIP: any 5 digits

## Technical Requirements

- **Node.js**: v14.0.0 or higher (v22.14.0 recommended)
- **NPM**: v6.0.0 or higher
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Dependencies**: Express, Stripe, Nodemailer, Multer, UUID, etc. (all included in package.json)

## Troubleshooting

If you encounter issues:

1. **Server won't start**:
   - Check Node.js version (`node -v`)
   - Ensure all dependencies are installed (`npm install`)
   - Check for port conflicts (default is 3000)

2. **Image display issues**:
   - Verify image paths are correct
   - Check file formats (JPG, PNG, GIF supported)
   - Ensure reference photos are in `images/reference-photos/` directory

3. **Payment integration issues**:
   - Verify Stripe API keys in server.js
   - Check browser console for JavaScript errors
   - Ensure you're using Stripe test cards for testing

4. **Email functionality not working**:
   - Update email credentials in server.js or .env file
   - For Gmail, use app password instead of regular password

## Quick Start Command

For the quickest setup, run this one-liner to install dependencies and start the server:

```bash
npm install && npm start
```

Then visit `http://localhost:3000` in your browser to see the website in action. 