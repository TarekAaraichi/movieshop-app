"use client";
import { useEffect } from "react";

export default function AddressToggleClient() {
  useEffect(() => {
    const form = document.getElementById(
      "checkout-form",
    ) as HTMLFormElement | null;
    if (!form) return;

    const checkbox = form.querySelector<HTMLInputElement>(
      "[data-toggle-save-address]",
    );
    const addressFields = document.getElementById("address-fields");
    const selectedInput = form.querySelector<HTMLInputElement>(
      "input[name=selectedAddressId]",
    );

    if (!checkbox || !addressFields) {
      // No toggle to wire (likely no saved address) — ensure address inputs remain required
      const inputs = form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(
        "#address-fields input, #address-fields textarea, #address-fields select",
      );
      inputs.forEach((i) => {
        i.removeAttribute("disabled");
        i.setAttribute("required", "");
      });
      return;
    }

    const inputs = Array.from(
      addressFields.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select"),
    ).filter((el) => el.type !== "hidden");

    const setState = (useNewAddress: boolean) => {
      if (useNewAddress) {
        // enable inputs and require them
        inputs.forEach((i) => {
          i.removeAttribute("disabled");
          i.setAttribute("required", "");
        });
        addressFields.removeAttribute("aria-hidden");
        checkbox.setAttribute("aria-expanded", "true");
        // mark selectedAddressId as NEW so server creates new address
        if (selectedInput) selectedInput.value = "NEW";
      } else {
        // disable inputs so native validation ignores them
        inputs.forEach((i) => {
          i.setAttribute("disabled", "true");
          i.removeAttribute("required");
        });
        addressFields.setAttribute("aria-hidden", "true");
        checkbox.setAttribute("aria-expanded", "false");
        // restore selectedAddressId to existing id if present
        if (selectedInput && (selectedInput.dataset?.orig ?? null) !== null) {
          selectedInput.value = selectedInput.dataset.orig as string;
        }
      }
      // trigger input event so any form controllers recalc validity
      form.dispatchEvent(new Event("input", { bubbles: true }));
    };

    // Preserve original selectedAddressId value if present
    if (selectedInput && !selectedInput.dataset.orig) {
      selectedInput.dataset.orig = selectedInput.value || "";
    }

    // Initialize state: if checkbox is checked, allow new address; otherwise disable inputs
    setState(checkbox.checked === true);

    const onChange = () => setState(checkbox.checked === true);
    checkbox.addEventListener("change", onChange);

    return () => {
      checkbox.removeEventListener("change", onChange);
      // restore inputs
      inputs.forEach((i) => {
        i.removeAttribute("disabled");
        i.removeAttribute("required");
      });
      if (selectedInput && selectedInput.dataset.orig) {
        selectedInput.value = selectedInput.dataset.orig as string;
        delete selectedInput.dataset.orig;
      }
      addressFields.removeAttribute("aria-hidden");
      checkbox.removeAttribute("aria-expanded");
    };
  }, []);

  return null;
}
