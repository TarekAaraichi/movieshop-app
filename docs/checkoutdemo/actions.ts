"use server";

import { CART_COOKIE_NAME } from "@/cart/constants";
import { getCart } from "@/cart/data";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import z from "zod";

const submitOrderSchema = z.object({
  email: z.email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().regex(/^\d{3} \d{2}$/, "Invalid postal code"),
  country: z.enum(["se"]),
});

type SubmitOrderValues = z.infer<typeof submitOrderSchema>;

export async function submitOrder(values: SubmitOrderValues) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME);
  const cart = await getCart(cartId?.value);
  if (!cart) {
    return null;
  }

  const parsedValues = submitOrderSchema.parse(values);

  const productIds = cart.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      price: {
        select: {
          id: true,
          amount: true,
        },
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      customerInfo: {
        create: {
          email: parsedValues.email,
          firstName: parsedValues.firstName,
          lastName: parsedValues.lastName,
          address: parsedValues.address,
          city: parsedValues.city,
          postalCode: parsedValues.postalCode,
          country: parsedValues.country,
        },
      },

      orderItems: {
        createMany: {
          data: products.map((product) => ({
            priceId: product.price.id,
            productId: product.id,
            quantity:
              cart.items.find((item) => item.productId === product.id)
                ?.quantity || 1,
          })),
        },
      },

      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.cart.delete({ where: { id: cart.id } });
  cookieStore.delete(CART_COOKIE_NAME);
  revalidatePath("/", "layout");

  return order.id;
}