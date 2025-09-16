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

    // Intercept submit to show processing state
    const onSubmit = () => {
      try {
        // disable the submit button immediately
        submit.disabled = true;
        // Preserve original innerHTML and classes
        const originalHtml = submit.dataset.origHtml || submit.innerHTML;
        if (!submit.dataset.origHtml) submit.dataset.origHtml = originalHtml;
        if (!submit.dataset.origClass)
          submit.dataset.origClass = submit.className;
        // Add processing classes to indicate action in progress
        submit.classList.add(
          "cursor-wait",
          "bg-indigo-700",
          "disabled:opacity-60"
        );
        // show processing text and optional spinner (keeps spinner color aligned with button text)
        submit.innerHTML = `<svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns=\"http://www.w3.org/2000/svg\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z\"></path></svg> Processing...`;
      } catch {}
    };
    form.addEventListener("submit", onSubmit);

    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
      form.removeEventListener("submit", onSubmit);
    };
  }, [formId, submitId]);

  return null;
}
