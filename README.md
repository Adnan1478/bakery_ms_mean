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
Environment Variables

Create a .env file inside the backend folder and add:

PORT=5000
MONGO_URI=mongodb://localhost:27017/BakeryMS
JWT_SECRET=your_jwt_secret_here

EMAIL_USER=your_email_here
EMAIL_PASS=your_email_app_password_here

RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

Installation and Setup

1. Clone the repository
git clone https://github.com/Adnan1478/bakery_ms_mean.git
cd bakery_ms_mean

2. Backend setup

cd backend
npm install
npm run dev

The backend will run on:

http://localhost:5000
3. Frontend setup

Open a new terminal:

cd frontend
npm install
ng serve

The frontend will run on:

http://localhost:4200

API Modules

Authentication API
Product API
Category API
Order API
User API
Review API
Recipe API
Dashboard API
Payment API
Screenshots

Add your project screenshots here:

![Home Page](screenshots/home.png)
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9119a92b-cac1-4dbe-b2d9-f8422d39598a" />

![Admin Dashboard](screenshots/admin-dashboard.png)
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/02386fca-d04a-4175-95d7-4268d9d9484f" />

![Product Page](screenshots/products.png)
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/632e3580-16af-4c9b-837f-3f2aa953706c" />

Author
Adnan Mansuri

GitHub: Adnan1478
