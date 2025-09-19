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
        // Only control enabled state when not already processing a submit
        if (submit.dataset.processing === "1") return;
        submit.disabled = !form.checkValidity();
      } catch {
        // ignore
      }
    };

    // initial state
    update();

    form.addEventListener("input", update);
    form.addEventListener("change", update);

    // Intercept submit to show processing state (but only when form is valid and not already processing)
    const onSubmit = (e: Event) => {
      try {
        // If already processing, prevent double-handling
        if (submit.dataset.processing === "1") {
          // let the native submit proceed but avoid re-toggling UI
          return;
        }

        // If form is invalid, show validation messages and don't enter processing state
        if (!form.checkValidity()) {
          // let the browser show validation UI
          // calling reportValidity improves UX for some browsers
          if (typeof (form as any).reportValidity === "function") {
            (form as any).reportValidity();
          }
          // prevent default submission since it's invalid
          e.preventDefault();
          return;
        }

        // Enter processing state
        submit.dataset.processing = "1";
        submit.disabled = true;
        submit.setAttribute("aria-busy", "true");

        // Preserve original innerHTML and classes
        const originalHtml = submit.dataset.origHtml || submit.innerHTML;
        if (!submit.dataset.origHtml) submit.dataset.origHtml = originalHtml;
        if (!submit.dataset.origClass) submit.dataset.origClass = submit.className;

        // Add processing classes to indicate action in progress
        submit.classList.add("cursor-wait", "bg-indigo-700", "disabled:opacity-60");

        // show processing text and optional spinner (keeps spinner color aligned with button text)
        submit.innerHTML = `<svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg> Processing...`;
      } catch {
        // ignore errors during UI updates
      }
    };
    form.addEventListener("submit", onSubmit);

    return () => {
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
      form.removeEventListener("submit", onSubmit);

      // cleanup: restore original button state if we modified it and the component unmounts
      try {
        if (submit.dataset.origHtml) {
          submit.innerHTML = submit.dataset.origHtml;
          delete submit.dataset.origHtml;
        }
        if (submit.dataset.origClass) {
          submit.className = submit.dataset.origClass;
          delete submit.dataset.origClass;
        }
        if (submit.dataset.processing) {
          delete submit.dataset.processing;
        }
        submit.removeAttribute("aria-busy");
        // ensure disabled state is recalculated from validity
        submit.disabled = !form.checkValidity();
      } catch {
        // ignore
      }
    };
  }, [formId, submitId]);

  return null;
}
