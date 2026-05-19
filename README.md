# Bakery MS - MEAN Stack Bakery Management System

Bakery MS is a full-stack Bakery Management System built using the MEAN stack: MongoDB, Express.js, Angular, and Node.js. The system allows users to browse bakery products, manage carts, place orders, give reviews, and interact with bakery services. It also includes an admin panel for managing products, categories, users, orders, recipes, and dashboard statistics.

## Features

### User Features
- User registration and login
- Browse bakery products
- View product details
- Add products to cart
- Checkout and place orders
- View order history
- Submit product reviews
- Contact bakery
- Forgot password functionality

### Admin Features
- Admin dashboard
- Manage products
- Manage categories
- Manage users
- Manage orders
- Manage recipes
- View dashboard statistics

## Tech Stack

### Frontend
- Angular
- TypeScript
- HTML
- CSS
- Angular Router
- Angular Services

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer
- Razorpay Payment Gateway

## Project Structure

```txt
BakeryMSS/
│
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── angular.json
│   ├── package.json
│   └── README.md
│
└── README.md
```

## Environment Variables

Create a `.env` file inside the `backend` folder and add:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/BakeryMS
JWT_SECRET=your_jwt_secret_here

EMAIL_USER=your_email_here
EMAIL_PASS=your_email_app_password_here

RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Adnan1478/bakery_ms_mean.git
cd bakery_ms_mean
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on:

```txt
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
ng serve
```

The frontend will run on:

```txt
http://localhost:4200
```

## API Modules

- Authentication API
- Product API
- Category API
- Order API
- User API
- Review API
- Recipe API
- Dashboard API
- Payment API

## Screenshots

### Home Page

<img width="100%" alt="Home Page" src="PASTE_YOUR_GITHUB_IMAGE_URL_HERE" />

### Admin Dashboard

<img width="100%" alt="Admin Dashboard" src="PASTE_YOUR_GITHUB_IMAGE_URL_HERE" />

### Product Page

<img width="100%" alt="Product Page" src="PASTE_YOUR_GITHUB_IMAGE_URL_HERE" />

## Author

**Adnan Mansuri**

GitHub: [Adnan1478](https://github.com/Adnan1478)

## License

This project is created for academic and learning purposes.
