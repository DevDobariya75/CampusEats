### CampusEats (MERN) — Full Setup + Frontend/Backend Connection

This repo contains:

- **Backend**: `backend/` (Express + MongoDB + JWT Auth)
- **Frontend**: `frontend/` (React + Vite + Tailwind + Router + Axios)

> Project reference: [`chatgpt.com/share/696e4631-d240-800e-ae7f-c7088a465848`](https://chatgpt.com/share/696e4631-d240-800e-ae7f-c7088a465848)

---

### 1) Backend Setup (API)

#### Install

Open terminal in project root:

```bash
cd backend
npm install
```

#### Create `backend/.env`

Create a file named **`.env`** inside `backend/` (you must create this manually).

Minimal example:

```bash
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://localhost:27017/campuseats

JWT_SECRET=change_this_secret_in_production
JWT_EXPIRE=30d
```

#### Run backend

```bash
npm start
```

Backend health check:

- `GET http://localhost:5000/api/health`

---

### 2) Frontend Setup (React)

#### Install

```bash
cd frontend
npm install
```

#### Create `frontend/.env`

Create a file named **`.env`** inside `frontend/`:

```bash
VITE_API_URL=http://localhost:5000
```

#### Run frontend

```bash
npm run dev
```

Frontend runs at:

- `http://localhost:5173`

---

### 3) How Frontend Connects to Backend

#### Base URL

Frontend uses `VITE_API_URL` from `frontend/.env`.

See:

- `frontend/src/api/http.ts` (Axios baseURL + JWT interceptor)

#### Auth flow (JWT)

- Login/Register returns a `token`
- Frontend stores it in `localStorage`
- All future requests include:
  - `Authorization: Bearer <token>`

See:

- `frontend/src/store/authStore.ts` (stores token/user)
- `frontend/src/api/http.ts` (injects the token header)
- `frontend/src/components/auth/RequireAuth.tsx` (protects routes)

#### Roles

- `admin` — can create shopkeepers/delivery partners via `/api/auth/admin/create-user`
- `shopkeeper` — manages shops/menu items, updates order status to `preparing` / `ready_for_delivery`
- `delivery_partner` — sees ready orders, accepts up to 3, marks delivered
- `customer` — browses shops, places orders

#### Backend endpoints used by frontend

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (protected)
- **Shops**
  - `GET /api/shops`
  - `GET /api/shops/:id`
- **Menu Items**
  - `GET /api/menu-items/shop/:shopId`
- **Orders**
  - `POST /api/orders` (protected)
  - `GET /api/orders` (protected)

---

### 4) Important Notes

- **CORS**: backend uses `CLIENT_URL` (set it to your frontend URL).
- **Role support**:
  - `student` can place orders
  - `shop_owner` can create shops / add menu items (owner/admin routes exist in backend)
- **Payments**: frontend currently supports choosing payment method; real payment gateway integration can be added later.

---

### 5) What you can add next (recommended)

- Shop owner dashboard (create shop, add/edit menu items)
- Reviews UI (create + list reviews)
- Profile update screens (update details + password)
- Image upload (shops/menu items) via `multer` and a CDN/storage

