import { request } from './client'

export const userApi = {
  register: (formData) => request('/users/register', { method: 'POST', body: formData }),
  confirmRegistration: (body) => request('/users/register/confirm-otp', { method: 'POST', body }),
  resendRegistrationOtp: (body) => request('/users/register/resend-otp', { method: 'POST', body }),
  login: (body) => request('/users/login', { method: 'POST', body }),
  getCurrentUser: () => request('/users/current-user'),
  logout: (body) => request('/users/logout', { method: 'POST', body }),
  updateProfile: (formData) => request('/users/profile', { method: 'PATCH', body: formData }),
  changePassword: (body) => request('/users/change-password', { method: 'POST', body }),
  forgotPassword: (body) => request('/users/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => request('/users/reset-password', { method: 'POST', body }),
}

export const shopsApi = {
  list: (query = '') => request(`/shops${query ? `?${query}` : ''}`),
  getById: (shopId) => request(`/shops/${shopId}`),
  getMine: () => request('/shops/my-shop'),
  create: (formData) => request('/shops', { method: 'POST', body: formData }),
  update: (shopId, formData) => request(`/shops/${shopId}`, { method: 'PATCH', body: formData }),
  toggle: (shopId) => request(`/shops/${shopId}/toggle`, { method: 'PATCH' }),
}

export const menuApi = {
  listByShop: (shopId, query = '') => request(`/menu-items/${shopId}${query ? `?${query}` : ''}`),
  create: (shopId, formData) => request(`/menu-items/${shopId}`, { method: 'POST', body: formData }),
  update: (shopId, itemId, formData) =>
    request(`/menu-items/${shopId}/item/${itemId}`, { method: 'PATCH', body: formData }),
  toggle: (shopId, itemId) => request(`/menu-items/${shopId}/item/${itemId}/toggle`, { method: 'PATCH' }),
  updateStock: (shopId, itemId, body) => request(`/menu-items/${shopId}/item/${itemId}/stock`, { method: 'PATCH', body }),
}

export const cartApi = {
  getCartItems: (shopId) => request(`/carts/${shopId}/items`),
  addItem: (shopId, body) => request(`/carts/${shopId}/items`, { method: 'POST', body }),
  updateItem: (shopId, itemId, body) => request(`/carts/${shopId}/items/${itemId}`, { method: 'PATCH', body }),
  removeItem: (shopId, itemId) => request(`/carts/${shopId}/items/${itemId}`, { method: 'DELETE' }),
  clearCart: (shopId) => request(`/carts/${shopId}`, { method: 'DELETE' }),
  getSummary: (shopId) => request(`/carts/${shopId}/summary`),
}

export const ordersApi = {
  create: (body) => request('/orders', { method: 'POST', body }),
  listMine: () => request('/orders'),
  listForShop: (shopId) => request(`/orders/shop/${shopId}`),
  getById: (orderId) => request(`/orders/${orderId}`),
  holdReservation: (body) => request('/orders/reservations/hold', { method: 'POST', body }),
  getReservation: (reservationId) => request(`/orders/reservations/${reservationId}`),
  releaseReservation: (reservationId, body = {}) =>
    request(`/orders/reservations/${reservationId}/release`, { method: 'POST', body }),
  updateStatus: (orderId, body) => request(`/orders/${orderId}/status`, { method: 'PATCH', body }),
  cancel: (orderId) => request(`/orders/${orderId}/cancel`, { method: 'PATCH' }),
}

export const addressesApi = {
  list: () => request('/delivery-addresses'),
  create: (body) => request('/delivery-addresses', { method: 'POST', body }),
  update: (addressId, body) => request(`/delivery-addresses/${addressId}`, { method: 'PATCH', body }),
  setDefault: (addressId) => request(`/delivery-addresses/${addressId}/set-default`, { method: 'PATCH' }),
  remove: (addressId) => request(`/delivery-addresses/${addressId}`, { method: 'DELETE' }),
}

export const notificationsApi = {
  list: () => request('/notifications'),
  unreadCount: () => request('/notifications/unread-count'),
  markRead: (notificationId) => request(`/notifications/${notificationId}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
}

export const deliveriesApi = {
  listMine: () => request('/deliveries'),
  accept: (deliveryId) => request(`/deliveries/${deliveryId}/accept`, { method: 'PATCH' }),
  markPickedUp: (deliveryId) => request(`/deliveries/${deliveryId}/picked-up`, { method: 'PATCH' }),
  markDelivered: (deliveryId, body) => request(`/deliveries/${deliveryId}/delivered`, { method: 'PATCH', body }),
  stats: () => request('/deliveries/stats'),
}

export const paymentsApi = {
  create: (body) => request('/payments', { method: 'POST', body }),
  updateStatus: (paymentId, body) => request(`/payments/${paymentId}/status`, { method: 'PATCH', body }),
  verifyUpi: (paymentId, body) => request(`/payments/${paymentId}/verify-upi`, { method: 'POST', body }),
}
