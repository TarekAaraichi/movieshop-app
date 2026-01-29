"use client";

import { useEffect } from "react";

export default function AddressSelectorClient({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const select = form.querySelector(
      "select[name='selectedAddressId']",
    ) as HTMLSelectElement | null;
    const hidden = form.querySelector(
      "input[name='selectedAddressId']",
    ) as HTMLInputElement | null;
    const checkbox = form.querySelector(
      "input[name='useNewAddress']",
    ) as HTMLInputElement | null;
    const container = document.getElementById("address-fields");

    const addressFields = [
      "line1",
      "line2",
      "city",
      "postalCode",
      "country",
    ].map(
      (n) => form.querySelector(`[name='${n}']`) as HTMLInputElement | null,
    );

    const hasSavedAddress = !!select || !!hidden;

    const toggle = () => {
      const checked = !!(checkbox && checkbox.checked);
      const useExisting = hasSavedAddress && !checked;
      const showFields = !useExisting;
      for (const el of addressFields) {
        if (!el) continue;
        el.disabled = useExisting;
        if (useExisting) {
          el.removeAttribute("required");
        } else {
          el.setAttribute("required", "");
        }
      }
      if (hidden) {
        hidden.disabled = checked;
      }
      if (container) {
        container.style.display = showFields ? "" : "none";
      }
    };

    const onSelectChange = () => {
      // if user picked an existing address, uncheck 'useNewAddress'
      if (checkbox && select && select.value && select.value !== "NEW") {
        checkbox.checked = false;
      }
      toggle();
    };

    const onCheckboxChange = () => {
      if (checkbox && checkbox.checked && select) {
        try {
          select.value = "NEW";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        } catch {
          /* ignore */
        }
      }
      toggle();
    };

    if (select) select.addEventListener("change", onSelectChange);
    if (checkbox) checkbox.addEventListener("change", onCheckboxChange);

    // initial
    toggle();

    return () => {
      if (select) select.removeEventListener("change", onSelectChange);
      if (checkbox) checkbox.removeEventListener("change", onCheckboxChange);
    };
  }, [formId]);

  return null;
}
