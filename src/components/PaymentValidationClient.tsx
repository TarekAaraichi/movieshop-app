"use client";

import { useEffect } from "react";
import { z } from "zod";

const cardSchema = z
  .string()
  .regex(/^[0-9]+$/, "Card number must contain only digits")
  .min(13, "Card number is too short")
  .max(19, "Card number is too long");

const postalSchema = z
  .string()
  .min(3, "Postal code is too short")
  .max(12, "Postal code is too long")
  .regex(/^[A-Za-z0-9 \- ]+$/, "Postal code contains invalid characters");

export default function PaymentValidationClient() {
  useEffect(() => {
    const form = document.getElementById(
      "checkout-form",
    ) as HTMLFormElement | null;
    if (!form) return;

    const cardInput = form.querySelector<HTMLInputElement>("#paymentToken");
    const cardErrorEl = document.getElementById("payment-token-error");

    const postalInput = form.querySelector<HTMLInputElement>("#postalCode");
    const postalErrorEl = document.getElementById("postal-code-error");

    const validateCard = () => {
      if (!cardInput || !cardErrorEl) return;
      const v = cardInput.value || "";
      const result = cardSchema.safeParse(v);
      if (!result.success) {
        const msg = result.error.issues?.[0]?.message ?? "Invalid card number";
        try {
          cardInput.setCustomValidity(msg);
        } catch {}
        cardErrorEl.textContent = msg;
      } else {
        try {
          cardInput.setCustomValidity("");
        } catch {}
        cardErrorEl.textContent = "";
      }
    };

    const validatePostal = () => {
      if (!postalInput || !postalErrorEl) return;
      const v = postalInput.value || "";
      const result = postalSchema.safeParse(v);
      if (!result.success) {
        const msg = result.error.issues?.[0]?.message ?? "Invalid postal code";
        try {
          postalInput.setCustomValidity(msg);
        } catch {}
        postalErrorEl.textContent = msg;
      } else {
        try {
          postalInput.setCustomValidity("");
        } catch {}
        postalErrorEl.textContent = "";
      }
    };

    // run initial validation for both
    validateCard();
    validatePostal();

    const onInput = () => {
      validateCard();
      validatePostal();
      // bubble input event for any form controllers to recalc validity
      form.dispatchEvent(new Event("input", { bubbles: true }));
    };

    cardInput?.addEventListener("input", onInput);
    cardInput?.addEventListener("change", onInput);
    postalInput?.addEventListener("input", onInput);
    postalInput?.addEventListener("change", onInput);

    return () => {
      cardInput?.removeEventListener("input", onInput);
      cardInput?.removeEventListener("change", onInput);
      postalInput?.removeEventListener("input", onInput);
      postalInput?.removeEventListener("change", onInput);
    };
  }, []);

  return null;
}
