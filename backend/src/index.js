//require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import { createServer } from 'node:http'
import { app } from "./app.js";
import connectDB from './db/index.js';
import { cleanupExpiredReservations } from "./services/inventoryReservation.service.js";
import { initializeSocket } from '../socketHandler.js';


dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    const server = createServer(app)
    initializeSocket(server)

    server.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);

        const cleanupTimer = setInterval(async () => {
            try {
                const releasedCount = await cleanupExpiredReservations()
                if (releasedCount > 0) {
                    console.log(`Released ${releasedCount} expired inventory reservations`)
                }
            } catch (error) {
                console.error('Inventory reservation cleanup failed', error)
            }
        }, 60 * 1000)

        cleanupTimer.unref()
        
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!!" , err);

})






