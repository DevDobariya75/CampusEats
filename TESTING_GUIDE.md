# CampusEats - Quick Start & Testing Guide

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (connection string ready)
- Code editor (VS Code recommended)

### Installation

#### 1. Backend Setup
```bash
cd backend
npm install

# Update .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=campuseats_jwt_secret_key_2024_change_in_production
# JWT_EXPIRE=30d
# CLIENT_URL=http://localhost:5173
# NODE_ENV=development

npm start
# Server will run on http://localhost:5000
# MongoDB connection will be established
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App will run on http://localhost:5173
```

---

## 🧪 **Testing the Application**

### Step 1: Create Admin Account
```bash
# Use MongoDB Atlas or Compass to insert:
db.users.insertOne({
  name: "Admin User",
  email: "admin@campuseats.com",
  password: "Test123", // Will be hashed by pre-save hook
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Step 2: Admin Creates Shopkeeper
1. Open browser: http://localhost:5173
2. Click "Login"
3. Login with admin@campuseats.com / Test123
4. Go to `/admin/dashboard`
5. Click "Create Shopkeeper"
6. Fill form:
   - Name: "Chai Samosa Shop"
   - Email: "chai@shop.com"
   - Phone: "9876543210"
   - Shop Name: "Chai Samosa Cafe"
7. System generates temporary password → Save it
8. Shopkeeper can login with this email and temporary password

### Step 3: Admin Creates Delivery Partner
1. In Admin Dashboard
2. Click "Create Delivery Partner"
3. Fill form:
   - Name: "Raj Kumar"
   - Email: "raj@delivery.com"
   - Phone: "9988776655"
4. System generates temporary password → Save it

### Step 4: Shopkeeper Logs In & Adds Menu
1. Logout from admin account
2. Login as shopkeeper (chai@shop.com / temporary-password)
3. Go to `/shopkeeper/dashboard`
4. Click "Menu" tab
5. Click "Add Item"
6. Add items:
   - Name: "Masala Chai"
   - Price: 20
   - Category: Beverage
   - Description: "Hot masala chai"
   - Check: Vegetarian
7. Add more items (Samosas, Vada, etc.)
8. View "Sales" tab to see statistics

### Step 5: Customer Orders Food
1. Logout from shopkeeper
2. Open new incognito window
3. Go to http://localhost:5173 (Home page)
4. Register new customer:
   - Name: "Student Name"
   - Email: "student@campus.edu"
   - Password: "Student123" (must have uppercase, lowercase, number)
5. You're logged in as customer
6. Browse shops (should see "Chai Samosa Cafe")
7. Click on shop
8. View menu items
9. Add items to cart
10. Go to cart, click checkout
11. Fill delivery address:
    - Building: "Block A"
    - Room: "105"
12. Choose payment method: "Cash"
13. Click "Place Order"
14. Go to "My Orders" to see order status

### Step 6: Shopkeeper Updates Order
1. Logout customer
2. Login as shopkeeper
3. Go to `/shopkeeper/dashboard`
4. Click "Orders" tab
5. See new order with status "Pending"
6. Click dropdown: "Update Status"
7. Select "Preparing"
8. Update again to "Ready"

### Step 7: Delivery Partner Accepts Order
1. Logout shopkeeper
2. Login as delivery partner (raj@delivery.com / temporary-password)
3. Go to `/delivery/dashboard`
4. Click "Available Orders"
5. Should see ready order
6. Click "Accept Order"
7. Go to "My Active Deliveries"
8. Click "Mark as Delivered"

### Step 8: Customer Sees Delivery
1. Logout delivery partner
2. Login as customer again
3. Go to "My Orders"
4. Refresh page
5. Order should show final status: "Delivered"

---

## 🔄 **Full User Journey Map**

```
┌─────────────────────────────────────────────────────────────┐
│                     CAMPUSEATS APPLICATION                   │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   Home Page      │
                    │  Browse Shops    │
                    └──────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
            ┌───────▼──────┐   ┌─────▼────────┐
            │    Login     │   │   Register   │
            │              │   │              │
            └───────┬──────┘   └─────┬────────┘
                    │                │
                    └────────┬───────┘
                             │
                    ┌────────▼────────┐
                    │  Customer Role  │
                    │  (Authenticated)│
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼────────┐  ┌────▼────────┐  ┌───▼──────────┐
     │ Browse Shops  │  │  My Orders   │  │   Profile    │
     │ & Menu        │  │              │  │              │
     └──────┬────────┘  └────┬────────┘  └───┬──────────┘
            │                │               │
     ┌──────▼────────┐       │
     │  Add to Cart  │       │
     │  & Checkout   │       │
     └──────┬────────┘       │
            │                │
     ┌──────▼────────┐       │
     │  Place Order  │       │
     │  (Send to API)│       │
     └──────┬────────┘       │
            │                │
            │     ┌──────────┴────────┐
            │     │                   │
            └────▶│  Shopkeeper Role  │
                  │  (Shop Owner)     │
                  └────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼──────┐  ┌────────▼────────┐  ┌────▼──────┐
   │ Dashboard │  │  Menu Items     │  │  Orders   │
   │ Overview  │  │  Management     │  │ & Status  │
   └────┬──────┘  └────────┬────────┘  └────┬──────┘
        │                  │                │
   ┌────▼──────┐  ┌────────▼────────┐  ┌────▼──────┐
   │ Statistics│  │ Add/Edit/Delete │  │ Update to │
   │ & Sales   │  │ Items           │  │ Preparing │
   │ Reports   │  │                 │  │ → Ready   │
   └───────────┘  └─────────────────┘  └────┬──────┘
                                             │
                                    ┌────────▼──────────┐
                                    │ Delivery Partner   │
                                    │ (Delivery Staff)   │
                                    └────────┬──────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
            ┌───────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
            │   Dashboard    │      │ Available Orders│      │ My Deliveries   │
            │                │      │                 │      │                 │
            └────────────────┘      └────────┬────────┘      └────────┬────────┘
                                             │                        │
                                     ┌───────▼────────┐      ┌────────▼────────┐
                                     │ Accept Order   │      │ Update Status   │
                                     │ (First-come)   │      │ Out for Delivery│
                                     └────────────────┘      │ → Delivered     │
                                                             └────────────────┘
```

---

## 📊 **API Testing with Postman/cURL**

### 1. Customer Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Student",
    "email": "john@campus.edu",
    "password": "John123456",
    "role": "student"
  }'
```

### 2. Customer Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@campus.edu",
    "password": "John123456"
  }'
```

### 3. Browse Shops
```bash
curl -X GET http://localhost:5000/api/shops?limit=10
```

### 4. Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "shop": "SHOP_ID",
    "orderItems": [
      {
        "menuItem": "MENU_ITEM_ID",
        "quantity": 2
      }
    ],
    "paymentMethod": "cash",
    "deliveryAddress": {
      "building": "Block A",
      "room": "105"
    }
  }'
```

---

## 🐛 **Troubleshooting**

### Issue: MongoDB Connection Failed
**Solution**: Check MONGO_URI in .env file, ensure:
- Credentials are correct
- IP is whitelisted in MongoDB Atlas
- Network connection is available

### Issue: JWT Token Invalid
**Solution**: 
- Ensure JWT_SECRET matches between requests
- Clear localStorage and login again
- Check token expiration

### Issue: CORS Errors
**Solution**:
- Frontend and backend must be running
- Check CLIENT_URL in backend .env
- Ensure CORS middleware is enabled

### Issue: Port Already in Use
**Solution**:
```bash
# Kill process using port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process using port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 📱 **Login Credentials for Testing**

### Admin Account
- Email: `admin@campuseats.com`
- Password: `Test123` (or change after creation)
- Dashboard: `/admin/dashboard`

### Test Shopkeeper (created via admin)
- Email: `chai@shop.com`
- Password: Auto-generated by admin
- Dashboard: `/shopkeeper/dashboard`

### Test Delivery Partner (created via admin)
- Email: `raj@delivery.com`
- Password: Auto-generated by admin
- Dashboard: `/delivery/dashboard`

### Test Customer (self-registered)
- Email: Any email you register
- Password: Must contain uppercase, lowercase, number
- Home: `/`

---

## ✅ **Checklist for Complete Testing**

- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] Admin can login
- [ ] Admin can create shopkeeper account
- [ ] Admin can create delivery partner account
- [ ] Admin can view dashboard stats
- [ ] Shopkeeper can login with generated password
- [ ] Shopkeeper can add menu items
- [ ] Shopkeeper can view orders
- [ ] Shopkeeper can update order status
- [ ] Customer can register
- [ ] Customer can login
- [ ] Customer can browse shops
- [ ] Customer can view menu
- [ ] Customer can add items to cart
- [ ] Customer can checkout
- [ ] Customer can see order in "My Orders"
- [ ] Delivery partner can view available orders
- [ ] Delivery partner can accept order
- [ ] Delivery partner can update delivery status
- [ ] Customer sees updated order status

---

## 🎓 **Key Concepts**

### JWT Flow
1. User logs in → Backend generates JWT with user ID
2. Token is returned and stored in localStorage
3. All subsequent requests include token in Authorization header
4. Backend validates token with JWT_SECRET
5. On logout, token is removed from localStorage

### Order Status Flow
```
pending → confirmed → preparing → ready → out_for_delivery → delivered
                                    ↓
                           (assigned to delivery partner here)
```

### Role-Based Access
- **admin**: Can access `/api/admin/*` routes
- **shop_owner**: Can access `/api/shopkeeper/*` routes
- **delivery_person**: Can access `/api/delivery/*` routes
- **student**: Can access customer routes only

---

## 📞 **Common Commands**

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Run backend in production
cd backend && npm start (after npm run build)

# Check if ports are in use
lsof -i :5000      # macOS/Linux
lsof -i :5173

netstat -ano | findstr :5000  # Windows
```

---

## 🎉 **You're All Set!**

The CampusEats application is now complete and ready for testing. Follow the testing steps above to ensure everything works correctly.

**Questions?** Refer to the main [CAMPUS_EATS_COMPLETE.md](./CAMPUS_EATS_COMPLETE.md) for detailed documentation.

Happy testing! 🚀
