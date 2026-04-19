import Cart from "../models/carts.model.js";
import CartItem from "../models/cartItems.model.js";
import MenuItem from "../models/menuItems.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import InventoryReservation from "../models/inventoryReservations.model.js";
import { ApiError } from "../utils/ApiError.js";

const HOLD_MINUTES = 10;

const getCartItemsForReservation = async ({ customerId, shopId }) => {
    const cart = await Cart.findOne({ shop: shopId, customer: customerId });
    if (!cart) {
        throw new ApiError(400, "Cart is empty");
    }

    const cartItems = await CartItem.find({ cart: cart._id })
        .populate('menuItem', 'name stock isAvailable isDeleted');

    if (!cartItems.length) {
        throw new ApiError(400, "Cart is empty");
    }

    const normalized = cartItems.map((item) => ({
        menuItemId: item.menuItem?._id,
        name: item.menuItem?.name || item.name || 'Item',
        quantity: Number(item.quantity || 0),
        stock: Number(item.menuItem?.stock || 0),
        isAvailable: Boolean(item.menuItem?.isAvailable),
        isDeleted: Boolean(item.menuItem?.isDeleted)
    }));

    const invalid = normalized.find((item) => !item.menuItemId || item.quantity < 1);
    if (invalid) {
        throw new ApiError(400, "Cart contains invalid items. Please refresh your cart.");
    }

    return normalized;
};

export const holdInventoryForCart = async ({ customerId, shopId }) => {
    const existingPendingPayment = await InventoryReservation.findOne({
        customer: customerId,
        shop: shopId,
        status: 'pending_payment',
        expiresAt: { $gt: new Date() }
    });

    if (existingPendingPayment) {
        throw new ApiError(409, "You already have an order awaiting payment for this shop");
    }

    const existingActive = await InventoryReservation.findOne({
        customer: customerId,
        shop: shopId,
        status: 'active',
        expiresAt: { $gt: new Date() }
    });

    if (existingActive) {
        await releaseReservationById({ reservationId: existingActive._id, reason: 'replaced' });
    }

    const items = await getCartItemsForReservation({ customerId, shopId });

    const reservedItems = [];

    try {
        for (const item of items) {
            if (!item.isAvailable || item.isDeleted) {
                throw new ApiError(409, `Item just went out of stock: ${item.name}`);
            }

            const updateResult = await MenuItem.updateOne(
                {
                    _id: item.menuItemId,
                    isDeleted: false,
                    isAvailable: true,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                }
            );

            if (updateResult.modifiedCount !== 1) {
                throw new ApiError(409, `Item just went out of stock: ${item.name}`);
            }

            reservedItems.push(item);
        }
    } catch (error) {
        if (reservedItems.length) {
            await Promise.all(
                reservedItems.map((item) =>
                    MenuItem.updateOne(
                        { _id: item.menuItemId },
                        { $inc: { stock: item.quantity } }
                    )
                )
            );
        }

        throw error;
    }

    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

    const reservation = await InventoryReservation.create({
        customer: customerId,
        shop: shopId,
        items: reservedItems.map((item) => ({
            menuItem: item.menuItemId,
            name: item.name,
            quantity: item.quantity
        })),
        status: 'active',
        expiresAt
    });

    return reservation;
};

export const markReservationPendingPayment = async ({ reservationId, customerId, shopId, orderId }) => {
    const reservation = await InventoryReservation.findOneAndUpdate(
        {
            _id: reservationId,
            customer: customerId,
            shop: shopId,
            status: 'active',
            expiresAt: { $gt: new Date() }
        },
        {
            $set: {
                status: 'pending_payment',
                order: orderId
            }
        },
        { returnDocument: 'after' }
    );

    if (!reservation) {
        throw new ApiError(409, "Item just went out of stock. Please refresh and try again.");
    }

    return reservation;
};

export const completeReservation = async ({ reservationId }) => {
    await InventoryReservation.findOneAndUpdate(
        { _id: reservationId, status: { $in: ['active', 'pending_payment'] } },
        {
            $set: {
                status: 'completed',
                releaseReason: null,
                releasedAt: null
            }
        }
    );
};

export const releaseReservationById = async ({ reservationId, reason = 'released' }) => {
    const reservation = await InventoryReservation.findOneAndUpdate(
        {
            _id: reservationId,
            status: { $in: ['active', 'pending_payment'] }
        },
        {
            $set: {
                status: 'releasing'
            }
        },
        { new: false }
    );

    if (!reservation) {
        return null;
    }

    const previousStatus = reservation.status

    try {
        await Promise.all(
            reservation.items.map((item) =>
                MenuItem.updateOne(
                    { _id: item.menuItem },
                    { $inc: { stock: Number(item.quantity || 0) } }
                )
            )
        );

        await InventoryReservation.findByIdAndUpdate(
            reservation._id,
            {
                $set: {
                    status: 'released',
                    releasedAt: new Date(),
                    releaseReason: reason
                }
            }
        );

        if (reservation.order) {
            await Order.findByIdAndUpdate(reservation.order, {
                $set: { status: 'Cancelled' }
            });

            await Payment.updateMany(
                { order: reservation.order, status: 'Pending' },
                { $set: { status: 'Failed' } }
            );
        }

        return reservation;
    } catch (error) {
        await InventoryReservation.findByIdAndUpdate(
            reservation._id,
            {
                $set: {
                    status: previousStatus
                }
            }
        );
        throw error;
    }
};

export const getReservationForCustomer = async ({ reservationId, customerId }) => {
    return InventoryReservation.findOne({ _id: reservationId, customer: customerId })
        .populate('items.menuItem', 'name stock isAvailable')
        .populate('shop', 'name');
};

export const cleanupExpiredReservations = async () => {
    const expiredReservations = await InventoryReservation.find({
        status: { $in: ['active', 'pending_payment'] },
        expiresAt: { $lte: new Date() }
    }).select('_id');

    for (const reservation of expiredReservations) {
        await releaseReservationById({
            reservationId: reservation._id,
            reason: 'expired'
        });
    }

    return expiredReservations.length;
};
