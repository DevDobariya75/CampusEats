# CampusEats Implementation Guide

## ✅ Completed
- [x] Backend Setup (Express, MongoDB, JWT)
- [x] Core Models (User, Shop, MenuItem, Order, Review)
- [x] Auth Routes & Controllers
- [x] Frontend Structure (React + TypeScript + Tailwind)
- [x] Basic Routes Setup

## 📋 Implementation Roadmap (7 Days)

### Day 1: Backend Completion
- [ ] Admin endpoints (create shopkeeper, delivery partner, manage shops)
- [ ] Shopkeeper endpoints (manage items, view orders, sales stats)
- [ ] Delivery Partner endpoints (view available orders, accept order, update status)
- [ ] Customer endpoints (list shops, create order, track order)

### Day 2: Frontend - Auth Pages
- [x] Login Page (basic structure exists)
- [x] Register Page (basic structure exists)
- [ ] Role-based redirect after login

### Day 3: Frontend - Admin Dashboard
- [ ] User Management (create shopkeeper, delivery partner)
- [ ] Shop Enable/Disable
- [ ] Order Monitoring
- [ ] Basic Analytics

### Day 4: Frontend - Shopkeeper Dashboard
- [ ] Food Item Management (Add/Edit/Delete)
- [ ] Order Management
- [ ] Sales Dashboard (Today, Last 7 days, Last month)
- [ ] Sales Graph

### Day 5: Frontend - Delivery Partner Dashboard
- [ ] Available Orders List
- [ ] Accept Order
- [ ] Update Delivery Status

### Day 6: Frontend - Customer Features
- [ ] Browse Shops
- [ ] Menu Items Display
- [ ] Add to Cart
- [ ] Checkout with Location Selection
- [ ] Payment Method Selection

### Day 7: Testing & Polish
- [ ] End-to-end testing
- [ ] Error handling
- [ ] UI/UX improvements
- [ ] Performance optimization

## 🔑 Key Features by Role

### Admin
- Create shopkeeper accounts with auto-generated credentials
- Create delivery partner accounts with auto-generated credentials
- View all users
- View all orders
- Enable/disable shops
- Dashboard with order counts

### Shopkeeper
- Login with provided credentials
- Add/update/delete food items
- View current orders
- Update order status (Preparing → Ready)
- Sales summary (Today, Last 7 days, Last month)
- Sales graph using Recharts

### Delivery Partner
- Login with provided credentials
- View available orders (only pending/confirmed)
- Accept orders (first-come wins)
- Update delivery status (Out for delivery → Delivered)
- Assigned orders list

### Customer
- Signup/Login
- Browse all campus shops
- View menu items and prices
- Add items to cart
- Select delivery location
- Choose payment method (Cash/Online/Card)
- Track order status
- Contact shopkeeper and delivery partner
- Order history

## 🗄️ Database Schema Summary

### User
- name, email, password (hashed)
- role (admin, shopkeeper, delivery_partner, student)
- phone, address
- isActive, timestamps

### Shop
- name, description, owner (User ref)
- address, contact info
- rating, numReviews
- deliveryTime, deliveryFee
- isActive, isOpen
- openingHours

### MenuItem
- name, description, price
- shop (Shop ref)
- category, image
- isAvailable
- ratings, numReviews

### Order
- user (User ref), shop (Shop ref)
- orderItems (MenuItem refs with quantity)
- deliveryAddress
- paymentMethod, paymentStatus
- prices (items, delivery, tax, total)
- status (pending → confirmed → preparing → ready → out_for_delivery → delivered)
- deliveryPartner (User ref, assigned when accepted)

### Review
- user (User ref)
- shop (Shop ref)
- rating, comment
- timestamps

