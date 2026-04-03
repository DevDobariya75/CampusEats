import { Server } from 'socket.io'

const toOrderRoom = (orderId) => `order:${orderId}`

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGIN || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    socket.on('joinOrder', ({ orderId }) => {
      if (!orderId) {
        return
      }

      socket.join(toOrderRoom(orderId))
      socket.emit('joinedOrder', { orderId })
    })

    socket.on('updateLocation', ({ orderId, latitude, longitude, accuracy, heading, speed, timestamp }) => {
      if (!orderId || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return
      }

      io.to(toOrderRoom(orderId)).emit('locationUpdate', {
        orderId,
        latitude,
        longitude,
        accuracy: typeof accuracy === 'number' ? accuracy : null,
        heading: typeof heading === 'number' ? heading : null,
        speed: typeof speed === 'number' ? speed : null,
        timestamp: timestamp || Date.now(),
      })
    })
  })

  return io
}
