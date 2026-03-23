# CampusEats

Smart campus food ordering and pickup, built to make student meals faster and simpler.

## Overview

CampusEats is a full‑stack food ordering platform designed for university and college campuses. 
Students can discover nearby campus shops, browse menus, build carts, place orders, pay securely,
and pick up their food without standing in long lines. Shop owners and delivery partners get
dedicated flows to manage menus, orders, and deliveries in real time.

You can view the system model/architecture here:
- [System model](https://app.eraser.io/workspace/johLP8FjV4rvWe8kPLbs)

## Core Features

- User authentication and authorization (students, shop owners, delivery partners, admins)
- Shop management (create/update shops, opening status, basic metadata)
- Menu management (menu items with prices, descriptions, images)
- Cart and cart items management per user
- Order placement with multiple items and quantities
- Delivery tracking and delivery partner assignment
- Saved delivery addresses for faster checkout
- Notifications for order status changes
- Payment integration layer (for capturing and storing payment details/status)
- Image upload & storage via Cloudinary (shop logos, menu item images, etc.)

## Tech Stack

- **Runtime:** Node.js
- **Backend framework:** Express
- **Database:** MongoDB via Mongoose ODM
- **Auth & security:** JSON Web Tokens (JWT), bcrypt, cookie‑based sessions
- **File uploads:** Multer
- **Media storage:** Cloudinary
- **Environment/config:** dotenv
- **Tooling:** nodemon, Prettier

All backend code currently lives in the `backend` folder.

## Getting Started (Backend)

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- MongoDB instance (local or hosted)
- Cloudinary account (for image upload) – optional but recommended

### Setup

1. Clone the repository:
	 ```bash
	 git clone <your-repo-url>
	 cd CampusEats
	 ```

2. Install backend dependencies:
	 ```bash
	 cd backend
	 npm install
	 ```

3. Create a `.env` file inside `backend` with at least:
	 ```env
	 PORT=5000
	 MONGODB_URI=mongodb://localhost:27017/campuseats
	 JWT_SECRET=super-secret-key

	 CLOUDINARY_CLOUD_NAME=<your-cloud-name>
	 CLOUDINARY_API_KEY=<your-api-key>
	 CLOUDINARY_API_SECRET=<your-api-secret>
	 ```

4. Start the development server:
	 ```bash
	 npm run dev
	 ```

The backend will boot using `src/index.js` and expose the CampusEats REST API.

## High‑Level API Areas

Exact routes may evolve, but the backend is organized around these resource areas:

- **Auth & Users** – registration, login, logout, profile, roles.
- **Shops** – list shops, get single shop, create/update shop (owner/admin).
- **Menu Items** – list shop menu, create/update/delete items (owner/admin).
- **Cart** – view cart, add/remove items, update quantities.
- **Orders** – create order from cart, view past orders, track current ones.
- **Deliveries** – manage delivery status and delivery partner assignment.
- **Delivery Addresses** – CRUD for stored user addresses.
- **Payments** – initiate and track payments for orders.
- **Notifications** – fetch notifications about order and delivery updates.

## Roadmap / Next Steps

- Add full frontend (web or mobile) for students, shop owners, and delivery partners.
- Document all REST endpoints with Swagger/OpenAPI.
- Add real‑time order updates using WebSockets or a similar push mechanism.
- Integrate production‑ready payment gateway (Stripe/Razorpay/etc.).

---

CampusEats is still under active development. Feedback and contributions are welcome!

