export const CART_COOKIE_NAME = "cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: CART_COOKIE_MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};

export const prismaSelect = {
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: { select: { amount: true } },
            imageUrl: true,
          },
        },
      },
      omit: { createdAt: true, updatedAt: true },
    },
  },
  omit: {
    createdAt: true,
    updatedAt: true,
  },
} as const;