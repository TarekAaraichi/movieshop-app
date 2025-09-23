/**
 * Server action helpers: orderActions
 * High-level server actions to create and manage orders used by pages and APIs.
 */

import * as orderService from "@/server/services/orderService";

export async function serverCreateOrderFromCart(
  userId: string,
  items: { movieId: string; quantity: number }[],
  addressId?: string
) {
  // Thin server-action wrapper — validates caller context in higher-level code
  return await orderService.createOrderFromCart(userId, items, addressId);
}

export async function serverGetOrderById(orderId: string) {
  return orderService.getOrderById(orderId);
}
