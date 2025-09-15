"use client";

import { useEffect } from "react";

export default function CheckoutFormController({
  formId,
  submitId,
}: {
  formId: string;
  submitId: string;
}) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    const submit = document.getElementById(
      submitId
    ) as HTMLButtonElement | null;
    if (!form || !submit) return;

    const update = () => {
      try {
        submit.disabled = !form.checkValidity();
      } catch {
        // ignore
      }
    };

    // initial state
    update();

    form.addEventListener("input", update);
    form.addEventListener("change", update);

    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
    };
  }, [formId, submitId]);

  return null;
}
