import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/errorHandler.middleware.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true , limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes

import userRouter from './routes/user.routes.js'
import cartsRouter from './routes/carts.routes.js'
import orderRouter from './routes/order.routes.js'
import paymentRouter from './routes/payment.routes.js'
import shopsRouter from './routes/shops.routes.js'
import menuItemsRouter from './routes/menuItems.routes.js'
import deliveriesRouter from './routes/deliveries.routes.js'
import deliveryAddressesRouter from './routes/deliveryAddresses.routes.js'
import notificationsRouter from './routes/notifications.routes.js'
import orderItemsRouter from './routes/orderItems.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/carts", cartsRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/payments", paymentRouter)
app.use("/api/v1/shops", shopsRouter)
app.use("/api/v1/menu-items", menuItemsRouter)
app.use("/api/v1/deliveries", deliveriesRouter)
app.use("/api/v1/delivery-addresses", deliveryAddressesRouter)
app.use("/api/v1/notifications", notificationsRouter)
app.use("/api/v1/order-items", orderItemsRouter)

// Global error handler (MUST be last)
app.use(errorHandler)

export { app }