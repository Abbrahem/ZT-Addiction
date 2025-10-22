# Danger - Premium Sneakers E-commerce

A full-stack e-commerce website for premium sneakers built with React, Node.js serverless functions, and MongoDB Atlas.

## Features

### Public Features
- **Home Page**: Hero section, latest products preview, complaint form
- **Products Page**: Product listing with brand filtering
- **Product Details**: Image gallery, size/color selection, add to cart
- **Shopping Cart**: Item management, shipping calculation
- **Checkout**: Customer information form, order placement

### Admin Features
- **Admin Login**: Secure authentication with JWT cookies
- **Product Management**: Add, edit, delete products with image upload
- **Order Management**: View and update order status
- **Inventory Control**: Mark products as sold out

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Node.js Serverless Functions (Vercel)
- **Database**: MongoDB Atlas with GridFS for image storage
- **Authentication**: JWT with httpOnly cookies
- **Deployment**: Vercel
- **UI**: SweetAlert2 for notifications
- **Font**: Cairo (Google Fonts)

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@danger.com
ADMIN_PASSWORD=your_admin_password
WHATSAPP_NUMBER=01014011855
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Admin User
After deployment, call the seed endpoint:
```bash
POST /api/seed
```

### 4. Development
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication

### Products
- `GET /api/products` - Get all products (with optional brand filter)
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)
- `PATCH /api/products/[id]/soldout` - Toggle sold out status (admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin only)
- `PATCH /api/orders/[id]` - Update order status (admin only)

### Images
- `POST /api/upload` - Upload images (admin only)
- `GET /api/images/[id]` - Get image by ID

### Utilities
- `POST /api/seed` - Seed admin user

## Database Collections

### Products
```javascript
{
  name: String,
  priceEGP: Number,
  description: String,
  brand: String,
  sizes: [String],
  colors: [String],
  images: [ObjectId], // GridFS file IDs
  soldOut: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders
```javascript
{
  items: [{
    productId: ObjectId,
    name: String,
    size: String,
    color: String,
    quantity: Number,
    price: Number
  }],
  customer: {
    name: String,
    address: String,
    phone1: String,
    phone2: String
  },
  shippingFee: Number,
  total: Number,
  status: String, // pending, processing, shipped, delivered, cancelled
  createdAt: Date,
  updatedAt: Date
}
```

### Admins
```javascript
{
  email: String,
  password: String, // bcrypt hashed
  createdAt: Date
}
```

## Features Details

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface

### Image Management
- Multiple image upload per product
- GridFS storage for scalability
- Image optimization and caching

### Shopping Experience
- Persistent cart using localStorage
- Size and color selection
- Quantity management
- Shipping calculation (120 EGP)

### Admin Dashboard
- Secure authentication
- Product CRUD operations
- Order management with status updates
- Image upload with preview

### Complaint System
- WhatsApp integration
- Pre-filled message format
- Customer contact information

## Currency & Language
- **Currency**: Egyptian Pound (EGP)
- **Language**: English
- **Theme**: White background, dark text
- **Font**: Cairo (Arabic-friendly)

## Contact
- **WhatsApp**: 01014011855
- **Instagram**: @danger_sneakers
