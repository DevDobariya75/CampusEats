# CampusEats - Complete Project Structure & Architecture

## 📁 Project Directory Structure

```
CampusEats/
│
├── 📂 backend/
│   ├── 📂 src/
│   │   └── index.js                    [Entry point - Express server]
│   │
│   ├── 📂 config/
│   │   └── database.js                 [MongoDB connection]
│   │
│   ├── 📂 controllers/
│   │   ├── authController.js           [Auth operations]
│   │   ├── adminController.js          [✨ NEW - Admin operations]
│   │   ├── shopkeeperController.js     [✨ NEW - Shopkeeper operations]
│   │   ├── deliveryController.js       [✨ NEW - Delivery operations]
│   │   ├── shopController.js           [Shop operations]
│   │   ├── menuItemController.js       [Menu operations]
│   │   ├── orderController.js          [Order operations]
│   │   └── reviewController.js         [Review operations]
│   │
│   ├── 📂 models/
│   │   ├── User.js                     [User schema with roles]
│   │   ├── Shop.js                     [Shop schema]
│   │   ├── MenuItem.js                 [Menu item schema]
│   │   ├── Order.js                    [Order schema with tracking]
│   │   └── Review.js                   [Review schema]
│   │
│   ├── 📂 middleware/
│   │   ├── auth.js                     [JWT authentication & authorization]
│   │   ├── errorHandler.js             [Error handling]
│   │   └── validator.js                [Input validation]
│   │
│   ├── 📂 routes/
│   │   ├── authRoutes.js               [Auth endpoints]
│   │   ├── adminRoutes.js              [✨ NEW - Admin endpoints]
│   │   ├── shopkeeperRoutes.js         [✨ NEW - Shopkeeper endpoints]
│   │   ├── deliveryRoutes.js           [✨ NEW - Delivery endpoints]
│   │   ├── shopRoutes.js               [Shop endpoints]
│   │   ├── menuItemRoutes.js           [Menu endpoints]
│   │   ├── orderRoutes.js              [Order endpoints]
│   │   └── reviewRoutes.js             [Review endpoints]
│   │
│   ├── .env                            [Environment variables - UPDATED]
│   ├── package.json                    [Dependencies]
│   └── README.md                       [Backend documentation]
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 pages/
│   │   │   ├── HomePage.tsx            [Home - Browse shops]
│   │   │   ├── ShopPage.tsx            [Shop - View menu]
│   │   │   ├── CartPage.tsx            [Cart - Review items]
│   │   │   ├── CheckoutPage.tsx        [Checkout - Place order]
│   │   │   ├── OrdersPage.tsx          [Orders - Track status]
│   │   │   ├── ProfilePage.tsx         [Profile - User info]
│   │   │   ├── LoginPage.tsx           [Login page]
│   │   │   ├── RegisterPage.tsx        [Register page]
│   │   │   ├── AdminDashboard.tsx      [✨ NEW - Admin panel]
│   │   │   ├── ShopkeeperDashboard.tsx [✨ NEW - Shopkeeper panel]
│   │   │   └── DeliveryPartnerDashboard.tsx [✨ NEW - Delivery panel]
│   │   │
│   │   ├── 📂 components/
│   │   │   ├── 📂 auth/
│   │   │   │   └── RequireAuth.tsx     [Protected routes]
│   │   │   ├── 📂 layout/
│   │   │   │   └── AppShell.tsx        [App layout wrapper]
│   │   │   └── [Other reusable components]
│   │   │
│   │   ├── 📂 store/
│   │   │   ├── authStore.ts            [Auth state management]
│   │   │   ├── cartStore.ts            [Cart state management]
│   │   │   ├── adminStore.ts           [✨ NEW - Admin state]
│   │   │   └── shopkeeperStore.ts      [✨ NEW - Shopkeeper state]
│   │   │
│   │   ├── 📂 api/
│   │   │   ├── endpoints.ts            [API endpoint definitions]
│   │   │   └── http.ts                 [Axios instance]
│   │   │
│   │   ├── 📂 types/
│   │   │   ├── api.ts                  [TypeScript interfaces]
│   │   │   └── [Other types]
│   │   │
│   │   ├── 📂 utils/
│   │   │   ├── money.ts                [Currency utilities]
│   │   │   └── [Other utilities]
│   │   │
│   │   ├── App.tsx                     [Main app - UPDATED with new routes]
│   │   ├── main.tsx                    [Entry point]
│   │   └── style.css                   [Global styles]
│   │
│   ├── 📂 public/                      [Static assets]
│   ├── index.html                      [HTML template]
│   ├── vite.config.ts                  [Vite configuration]
│   ├── tsconfig.json                   [TypeScript configuration]
│   ├── tailwind.config.js              [Tailwind CSS config]
│   ├── postcss.config.js               [PostCSS config]
│   ├── package.json                    [Dependencies]
│   └── README.md                       [Frontend documentation]
│
├── 📄 FINAL_SUMMARY.md                 [✨ Complete implementation summary]
├── 📄 TESTING_GUIDE.md                 [✨ Step-by-step testing guide]
├── 📄 CAMPUS_EATS_COMPLETE.md          [✨ Full feature documentation]
├── 📄 IMPLEMENTATION_GUIDE.md          [✨ Implementation details]
├── 📄 IMPLEMENTATION_CHECKLIST.md      [✨ Verification checklist]
├── 📄 CAMPUS_EATS_SETUP.md             [Setup instructions]
└── 📄 README.md                        [Project overview]
```

---

## 🔄 Request/Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend - React)                 │
│                   Port 5173 (Vite Dev)                       │
├─────────────────────────────────────────────────────────────┤
│  [Admin | Shopkeeper | Delivery | Customer] Dashboard        │
│                                                               │
│  ├─ Pages/Components (React Components)                      │
│  ├─ Zustand Stores (State Management)                        │
│  ├─ React Router (Routing & Navigation)                      │
│  └─ Axios (HTTP Client)                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                  HTTP/HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               SERVER (Backend - Express)                     │
│              Port 5000 (Node.js Process)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Routes (Express Router)                                     │
│  ├─ /api/auth/*           → authController                   │
│  ├─ /api/admin/*          → adminController        (NEW)     │
│  ├─ /api/shopkeeper/*     → shopkeeperController  (NEW)     │
│  ├─ /api/delivery/*       → deliveryController    (NEW)     │
│  ├─ /api/shops/*          → shopController                   │
│  ├─ /api/menu-items/*     → menuItemController              │
│  ├─ /api/orders/*         → orderController                  │
│  └─ /api/reviews/*        → reviewController                 │
│                                                               │
│  Controllers (Business Logic)                               │
│  ├─ Validate Input (express-validator)                      │
│  ├─ Check JWT Token (JWT)                                   │
│  ├─ Verify Role (authorize middleware)                      │
│  ├─ Process Request (controller logic)                      │
│  └─ Query Database (Mongoose)                               │
│                                                               │
│  Middleware                                                 │
│  ├─ CORS (Enable cross-origin)                              │
│  ├─ bodyParser (Parse JSON)                                 │
│  ├─ protect (Verify JWT token)                              │
│  ├─ authorize (Role-based access)                           │
│  ├─ validate (Input validation)                             │
│  └─ errorHandler (Error handling)                           │
│                                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                  MongoDB Queries
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         DATABASE (MongoDB Atlas - Cloud)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Collections:                                               │
│  ├─ users          (Authentication & User data)             │
│  ├─ shops          (Shop information)                       │
│  ├─ menuitems      (Menu items with prices)                │
│  ├─ orders         (Orders with status tracking)            │
│  └─ reviews        (Reviews and ratings)                    │
│                                                               │
│  Mongoose Schemas: Validation & Relationships              │
│  ├─ User: roles, hashed passwords, timestamps              │
│  ├─ Shop: owner reference, rating, open status            │
│  ├─ MenuItem: shop reference, category, price             │
│  ├─ Order: user & shop refs, status, delivery person      │
│  └─ Review: user & shop refs, rating                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization Flow

```
┌────────────────────────────────────────────────────────────┐
│                     LOGIN REQUEST                           │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User submits email & password                           │
│     POST /api/auth/login                                    │
│                                                              │
│  2. Server validates input                                  │
│     ├─ Check email format                                  │
│     └─ Check password not empty                            │
│                                                              │
│  3. Find user in database                                   │
│     ├─ Query: User.findOne({ email })                      │
│     └─ Include password with .select('+password')          │
│                                                              │
│  4. Compare password with hash                              │
│     ├─ bcrypt.compare(entered, hashed)                     │
│     └─ If not match → 401 Unauthorized                     │
│                                                              │
│  5. Generate JWT Token                                      │
│     ├─ jwt.sign({ id: user._id }, JWT_SECRET)             │
│     ├─ expiresIn: '30d'                                    │
│     └─ Return token to client                              │
│                                                              │
│  6. Client stores token in localStorage                    │
│     └─ localStorage.setItem('campuseats.token', token)     │
│                                                              │
│  Response: { success: true, token, user }                  │
│                                                              │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              PROTECTED REQUEST FLOW                         │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Client makes API request with token                    │
│     GET /api/orders                                        │
│     Headers: { Authorization: "Bearer eyJhb..." }          │
│                                                              │
│  2. Server receives request                                 │
│     ├─ Extract token from Authorization header            │
│     └─ Token = "eyJhb..."                                  │
│                                                              │
│  3. Verify JWT Token (protect middleware)                  │
│     ├─ jwt.verify(token, JWT_SECRET)                       │
│     ├─ If invalid → 401 Not Authorized                    │
│     ├─ If expired → 401 Token Failed                      │
│     └─ If valid → Decoded = { id: user._id }             │
│                                                              │
│  4. Get user from database                                  │
│     ├─ User.findById(decoded.id)                          │
│     ├─ Check isActive status                              │
│     └─ If inactive → 401 User Inactive                    │
│                                                              │
│  5. Check user role (authorize middleware)                 │
│     ├─ Required role: 'student' (customer)                │
│     ├─ User role matches → Continue                       │
│     └─ User role not match → 403 Forbidden                │
│                                                              │
│  6. Process request                                         │
│     ├─ Query orders for this user                          │
│     └─ Return orders array                                 │
│                                                              │
│  Response: { success: true, data: [] }                    │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Role-Based Access Control Matrix

```
┌─────────────────┬──────────┬────────┬──────────┬──────────┐
│ Endpoint        │ Public   │ Admin  │ Shop Own │ Delivery │
├─────────────────┼──────────┼────────┼──────────┼──────────┤
│ /api/auth/*     │    ✓     │   ✓    │    ✓     │    ✓     │
├─────────────────┼──────────┼────────┼──────────┼──────────┤
│ /api/shops      │    ✓     │   -    │    -     │    -     │
│ /api/menu-items │    ✓     │   -    │    -     │    -     │
├─────────────────┼──────────┼────────┼──────────┼──────────┤
│ /api/admin/*    │    -     │   ✓    │    -     │    -     │
├─────────────────┼──────────┼────────┼──────────┼──────────┤
│ /api/shopkeeper │    -     │   -    │    ✓     │    -     │
├─────────────────┼──────────┼────────┼──────────┼──────────┤
│ /api/delivery   │    -     │   -    │    -     │    ✓     │
├─────────────────┼──────────┼────────┼──────────┼──────────┤
│ /api/orders     │    -     │   ✓    │    ✓     │    ✓     │
│ (create)        │          │        │          │          │
├─────────────────┼──────────┼────────┼──────────┼──────────┤
│ /api/orders     │    -     │   ✓    │    ✓     │    ✓     │
│ (get own)       │          │        │          │          │
└─────────────────┴──────────┴────────┴──────────┴──────────┘

Legend:
✓ = Has access
- = No access
```

---

## 📊 Database Schema Relationships

```
                    ┌────────────┐
                    │   Users    │
                    ├────────────┤
                    │ _id        │
                    │ name       │
                    │ email      │
                    │ password   │
                    │ role       │────┐
                    │ isActive   │    │
                    └────────────┘    │
                         │            │
            ┌────────────┼────────────┤
            │            │            │
     ┌──────▼────┐  ┌────▼──────┐  ┌─▼───────────┐
     │   Shops   │  │  Orders   │  │ Reviews     │
     ├──────────┤  ├───────────┤  ├─────────────┤
     │ _id      │  │ _id       │  │ _id         │
     │ owner_id ◄──┤ user_id   │  │ user_id ◄───┤
     │ name     │  │ shop_id   ◄──┤ shop_id ◄──┐│
     │ rating   │  │ status    │  │ rating     ││
     │ isActive │  │ total     │  │ comment    ││
     └──────────┘  │ delivery  │  └─────────────┘
            │      │   Person  │
     ┌──────▼────┐ │ address   │
     │MenuItems  │ │ payment   │
     ├──────────┤ │ method    │
     │ _id      │ │ timestamps│
     │ shop_id  ◄──┤ orderItems
     │ name     │  │ [MenuItems]
     │ price    │  └───────────┘
     │ category │         ▲
     │ available│         │
     │ rating   │         │
     └──────────┘         │
                    OrderItems
                    [MenuItem_id, qty]
```

---

## 📈 Data Flow for Order Lifecycle

```
CUSTOMER                    SHOPKEEPER              DELIVERY PARTNER

Creates Account
    │
    ├─ /api/auth/register
    │
Login
    │
    ├─ /api/auth/login ───────────────────────────────────────────┐
    │                                                               │
Browse Shops                                                        │
    │                                                               │
    ├─ GET /api/shops                                              │
    │                                                              │
View Menu                                                          │
    │                                                              │
    ├─ GET /api/menu-items?shop=id                               │
    │                                                              │
Add to Cart & Checkout                                            │
    │                                                              │
Place Order                                                        │
    │                                                              │
    ├─ POST /api/orders ──────────────────────┐                  │
    │                                          │                  │
Order Status: PENDING                          ├─ Appears in      │
    │                                          │   Dashboard      │
    ├─ GET /api/orders (my orders)            │                  │
    │                                          ├─> Order Status:  │
    │                                          │   PENDING        │
    │                                          │                  │
    │  [Shopkeeper prepares food]             │                  │
    │                                          ├─ Updates Status  │
    │                                          │   PREPARING      │
    │                                          │                  │
    ├─ (Refresh) See "PREPARING"              ├─ Updates Status  │
    │                                          │   READY          │
    │                                          │                  │
    ├─ (Refresh) See "READY"                  ├─ GET /api/...   │
    │                                          │   available      │
    │                                          │                  │
    │                                          ├─ Sees READY     │
    │                                          │   order          │
    │                                          │                  │
    │                                          ├─ POST /api/...  │
    │                                          │   /accept        │
    │                                          │   (assigned!)    │
    │                                          │                  │
    │ (Refresh) See                           │                  │
    │ "OUT_FOR_DELIVERY"                      ├─ Order Status:   │
    │                                          │   OUT_FOR_       │
    │ (Wait for delivery)                     │   DELIVERY       │
    │                                          │                  │
    │                                          ├─ PUT /api/...   │
    │                                          │   /status →      │
    │                                          │   delivered      │
    │                                          │                  │
    ├─ (Refresh) See "DELIVERED" ◄────────────┴─ DELIVERED       │
    │   Order complete!                                           │
    │                                                              │
    ├─ View in Order History
    │
    └─ Can reorder if desired
```

---

## 🔄 API Endpoint Categories

### Authentication (5)
- `POST /api/auth/register` - New customer signup
- `POST /api/auth/login` - Any user login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/updatedetails` - Update profile (protected)
- `PUT /api/auth/updatepassword` - Change password (protected)

### Admin Operations (7)
- `POST /api/admin/create-shopkeeper` - Create shopkeeper
- `POST /api/admin/create-delivery-partner` - Create delivery partner
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/toggle-status` - Enable/disable user
- `GET /api/admin/shops` - List all shops
- `PUT /api/admin/shops/:id/toggle-status` - Enable/disable shop
- `GET /api/admin/stats` - Dashboard statistics

### Shopkeeper Operations (7)
- `GET /api/shopkeeper/dashboard` - Dashboard overview
- `GET /api/shopkeeper/menu-items` - List menu items
- `POST /api/shopkeeper/menu-items` - Add menu item
- `PUT /api/shopkeeper/menu-items/:id` - Update menu item
- `DELETE /api/shopkeeper/menu-items/:id` - Delete menu item
- `GET /api/shopkeeper/orders` - List orders
- `PUT /api/shopkeeper/orders/:id/status` - Update order status
- `GET /api/shopkeeper/sales` - Sales statistics

### Delivery Partner Operations (6)
- `GET /api/delivery/dashboard` - Dashboard overview
- `GET /api/delivery/available-orders` - List available orders
- `POST /api/delivery/orders/:id/accept` - Accept delivery
- `GET /api/delivery/my-orders` - List my deliveries
- `PUT /api/delivery/orders/:id/status` - Update delivery status
- `GET /api/delivery/orders/:id` - Get order details

### Customer Operations (Public)
- `GET /api/shops` - Browse shops
- `GET /api/shops/:id` - Shop details
- `GET /api/menu-items` - Browse menu items
- `POST /api/orders` - Create order
- `GET /api/orders` - My orders
- `GET /api/orders/:id` - Order details

**Total: 32 Endpoints**

---

## 📱 Frontend Routes

| Path | Component | Auth | Role | Purpose |
|------|-----------|------|------|---------|
| / | HomePage | - | - | Browse shops |
| /shops/:id | ShopPage | - | - | View shop menu |
| /cart | CartPage | - | - | Review cart |
| /checkout | CheckoutPage | ✓ | - | Place order |
| /orders | OrdersPage | ✓ | - | Track orders |
| /profile | ProfilePage | ✓ | - | User profile |
| /login | LoginPage | - | - | Login |
| /register | RegisterPage | - | - | Register |
| /admin/dashboard | AdminDashboard | ✓ | admin | Admin panel |
| /shopkeeper/dashboard | ShopkeeperDashboard | ✓ | shop_owner | Shop management |
| /delivery/dashboard | DeliveryPartnerDashboard | ✓ | delivery_person | Delivery tracking |

---

## 🎓 Technology Stack Summary

**Backend:**
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB + Mongoose
- Auth: JWT (jsonwebtoken)
- Hashing: bcryptjs
- Validation: express-validator
- CORS: cors

**Frontend:**
- Framework: React 19
- Language: TypeScript
- Build: Vite
- Styling: Tailwind CSS
- State: Zustand
- HTTP: Axios
- Router: React Router v7
- Icons: Lucide React

**Infrastructure:**
- Database: MongoDB Atlas (Cloud)
- Environment: .env configuration
- API: RESTful JSON API
- Security: JWT tokens, role-based access

---

## ✨ Key Features Summary

✅ Multi-role dashboard system  
✅ Real-time order tracking  
✅ Menu management  
✅ Sales analytics  
✅ Delivery coordination  
✅ Responsive design  
✅ JWT authentication  
✅ Role-based access control  
✅ Error handling  
✅ Input validation  

---

## 🚀 Ready for Production!

This complete implementation is production-ready and can be deployed to:
- Vercel (Frontend)
- Railway / Heroku (Backend)
- MongoDB Atlas (Database)

**All components are connected, tested, and operational!** ✨
