# 🧪 CampusEats - Quick Testing Guide

**Status:** ✅ All servers running, all features ready to test

---

## 🚀 Server Status

✅ **Backend:** Running on http://localhost:5000  
✅ **Frontend:** Running on http://localhost:5173  
✅ **Database:** MongoDB Atlas connected  
✅ **Hot Reload:** Active on both servers

---

## 🎯 Quick Test Checklist

### Test 1: New Delivery Location Feature ⭐ NEW
**Path:** Register → Browse Shop → Add to Cart → Checkout

1. Open http://localhost:5173
2. Click "Register" → Create new customer account
3. Browse any shop → Add items to cart
4. Click "Checkout"
5. **NEW: Test Delivery Location Selection**
   - Click "🏨 Hostel" → Enter "Boys Hostel A" + "Room 201"
   - OR Click "🏢 Building" → Enter "CSE Block" + "A305"
   - OR Click "📍 Custom" → Enter "Near library entrance"
6. Select payment method (Cash/Card/Campus Card/Online)
7. Add special instructions (optional)
8. Click "Place Order"
9. ✅ Order should be created with delivery location

**Expected:** Order successfully placed with location saved

---

### Test 2: Order Details with Contact Info ⭐ NEW
**Path:** Orders → Click Order → See Full Details

1. After placing order, go to "Orders" page
2. **NEW: Orders are now clickable!**
3. Click on any order card
4. **Verify Order Details Page Shows:**
   - ✅ Status timeline with visual progress
   - ✅ Your delivery location displayed
   - ✅ All order items with prices
   - ✅ Payment breakdown (items + delivery + tax + total)
   - ✅ **Shopkeeper Contact Section** (name, phone, email)
   - ✅ Special instructions (if you added any)

**Expected:** Full order page with shopkeeper contact visible

---

### Test 3: Delivery Partner Contact ⭐ NEW
**Path:** Admin → Create Delivery Partner → Accept Order → See Contact

#### Step A: Create Delivery Partner (Admin)
1. Login as admin: `admin@campuseats.com` / `admin123`
2. Go to Admin Dashboard
3. Click "Create Delivery Partner"
4. Fill form:
   - Name: "John Rider"
   - Email: "john@delivery.com"
   - Phone: "9876543210"
5. Save → Note the temporary password

#### Step B: Accept Order (Delivery Partner)
1. Logout → Login as delivery partner (use credentials from Step A)
2. Go to Delivery Partner Dashboard
3. See "Available Orders" section
4. Click "Accept Order" on pending order
5. Order status changes to "Out for Delivery"

#### Step C: See Contact (Customer)
1. Logout → Login as customer (your original account)
2. Go to "Orders"
3. Click on the order that was just accepted
4. **NEW: Verify Delivery Partner Contact Section appears:**
   - ✅ Delivery partner name
   - ✅ Phone number (clickable tel: link)
   - ✅ Email address (clickable mailto: link)

**Expected:** Customer can now see and contact delivery partner

---

### Test 4: Complete Order Flow
**Full journey from order to delivery**

#### Customer Side:
1. Browse shop → Add items → Checkout
2. Select "Hostel: Girls Hostel B, Room 305"
3. Choose "Cash" payment
4. Add note: "Please knock twice"
5. Place order
6. View order details → See shopkeeper contact

#### Shopkeeper Side:
7. Login as shopkeeper
8. See new order in dashboard
9. Click "Confirm" → Status: Confirmed
10. Click "Preparing" → Status: Preparing
11. Click "Ready" → Status: Ready

#### Delivery Partner Side:
12. Login as delivery partner
13. See order in "Available Orders"
14. Click "Accept" → Status: Out for Delivery
15. Click "Mark as Delivered" → Status: Delivered

#### Customer Side Again:
16. Refresh order details page
17. **Verify all contacts shown:**
    - ✅ Shopkeeper: Name, Phone, Email
    - ✅ Delivery Partner: Name, Phone, Email
18. Status shows "Delivered" ✅

**Expected:** Complete workflow with all contacts visible at appropriate stages

---

## 📱 Feature Verification Matrix

| Feature | Where to Test | Status |
|---------|--------------|--------|
| Delivery location: Hostel | Checkout page | ⭐ NEW |
| Delivery location: Building | Checkout page | ⭐ NEW |
| Delivery location: Custom | Checkout page | ⭐ NEW |
| Location validation | Try submit without filling | ⭐ NEW |
| Clickable orders | Orders list page | ⭐ NEW |
| Order details page | Click any order | ⭐ NEW |
| Status timeline | Order details | ⭐ NEW |
| Delivery address display | Order details | ⭐ NEW |
| Shopkeeper contact | Order details | ⭐ NEW |
| Delivery partner contact | Order details (after assignment) | ⭐ NEW |
| Click-to-call | Phone number links | ⭐ NEW |
| Click-to-email | Email address links | ⭐ NEW |
| Special instructions | Order details | ⭐ NEW |
| Payment info breakdown | Order details | ⭐ NEW |

---

## 🎨 Visual Checks

### Checkout Page
```
Should see:
┌─────────────────────────────────────┐
│ Delivery Location                   │
│ [🏨 Hostel] [🏢 Building] [📍 Custom]│
│                                     │
│ (Fields appear based on selection) │
│                                     │
│ Payment                             │
│ [CASH] [CARD] [CAMPUS_CARD] [ONLINE]│
│                                     │
│ Notes                               │
│ [Text area for instructions]       │
└─────────────────────────────────────┘
```

### Order Details Page
```
Should see:
┌────────────────────────────────────────┐
│ ← Back to Orders                       │
│                                        │
│ Order #ABC12345                        │
│ 🟢 OUT_FOR_DELIVERY        ₹500       │
├────────────────────────────────────────┤
│ Order Status Timeline                  │
│ ✓ Pending                              │
│ ✓ Confirmed                            │
│ ✓ Preparing                            │
│ ✓ Ready                                │
│ ✓ Out for Delivery                     │
│ 5 Delivered                            │
├────────────────────────────────────────┤
│ 📍 Delivery Location                   │
│ Hostel: Boys Hostel A                  │
│ Room: 201                              │
├────────────────────────────────────────┤
│ 🍽️ Shop                                │
│ Name: Pizza Hub                        │
│ 📞 Phone: 9876543210                   │
│ ✉️ Email: pizza@hub.com                │
├────────────────────────────────────────┤
│ 🚴 Delivery Partner                    │
│ Name: John Rider                       │
│ 📞 Phone: 9876543210                   │
│ ✉️ Email: john@delivery.com            │
└────────────────────────────────────────┘
```

---

## 🔍 Common Issues & Solutions

### Issue: "Order details not showing contact info"
**Solution:** Make sure backend orderController.js has been updated with population. Check terminal for backend restart.

### Issue: "Delivery location not saving"
**Solution:** Check browser console for errors. Verify deliveryAddress field is in Order model.

### Issue: "Can't click on orders"
**Solution:** Clear browser cache and refresh. Vite HMR should have updated OrdersPage.tsx.

### Issue: "Delivery partner contact not showing"
**Solution:** This is normal! Contact only appears when order status is "out_for_delivery" or "delivered". Accept an order as delivery partner first.

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ **Checkout:** You can select 3 different location types  
✅ **Orders List:** Orders are clickable with hover effect  
✅ **Order Details:** Full page loads with timeline  
✅ **Shopkeeper Contact:** Always visible on order details  
✅ **Delivery Contact:** Appears after delivery partner accepts  
✅ **Phone Links:** Clicking phone opens dialer  
✅ **Email Links:** Clicking email opens mail client  
✅ **Location:** Your selected location displays correctly  

---

## 📊 Database Check

To verify data is saving correctly:

```javascript
// In MongoDB Compass or Atlas:
// Check an order document should have:

{
  deliveryAddress: {
    campus: "Boys Hostel A",  // or building
    room: "201",
    street: "..."  // if custom
  },
  shop: ObjectId(...),
  deliveryPerson: ObjectId(...),  // after assignment
  paymentMethod: "cash",
  specialInstructions: "Please knock twice"
}
```

---

## 🚀 Quick Start Testing

**Fastest way to test everything:**

1. **Open:** http://localhost:5173
2. **Register** new customer account
3. **Add** items to cart from any shop
4. **Checkout** with Hostel location
5. **View** order details → See shopkeeper contact ✅
6. **Login** as admin → Create delivery partner
7. **Login** as delivery partner → Accept your order
8. **Login** back as customer → See delivery partner contact ✅

**Total test time:** 5 minutes

---

## 📝 Test Data Suggestions

**Delivery Locations to Try:**
- Hostel: "Boys Hostel A", Room "201"
- Building: "Computer Science Block", Desk "A305"
- Custom: "Near main library, ground floor"

**Special Instructions to Try:**
- "Please knock twice"
- "Call when you arrive"
- "Leave at door"
- "Extra spicy please"

**Payment Methods:**
- Cash (most common)
- Card
- Campus Card
- Online (mock)

---

## ✅ Final Checklist

Before considering testing complete:

- [ ] Tested all 3 delivery location types
- [ ] Verified location saves and displays
- [ ] Clicked on order to see details page
- [ ] Confirmed shopkeeper contact shows
- [ ] Created delivery partner via admin
- [ ] Accepted order as delivery partner
- [ ] Verified delivery partner contact appears
- [ ] Tested phone number click-to-call
- [ ] Tested email click-to-email
- [ ] Verified special instructions display
- [ ] Checked payment breakdown accuracy

---

**Testing Status:** 🟢 READY  
**Servers:** 🟢 RUNNING  
**Features:** 🟢 ALL IMPLEMENTED  

Start testing now! 🚀
