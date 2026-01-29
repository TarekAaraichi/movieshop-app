"use client";

/**
 * ProfileEditor
 * Client component for editing user profile information with validation.
 */

import React from "react";
import Image from "next/image";
import { useState } from "react";
import { updateProfile } from "@/server/actions/usersActions";
import SaveButton from "./SaveButton";

export default function ProfileEditor({
  user,
  address,
}: {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
}) {
  const [preview, setPreview] = useState(user.image ?? "");

  return (
    <form action={updateProfile} className="grid grid-cols-1 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100">
          {preview ? (
            // Use unoptimized to allow external urls during development
            <Image
              src={preview}
              alt={user.name ?? "avatar"}
              width={80}
              height={80}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-600">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            aria-label="Full name"
            placeholder="Full name"
            defaultValue={user.name ?? ""}
            name="name"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Image URL
        </label>
        <input
          aria-label="Image URL"
          placeholder="https://.../avatar.jpg"
          name="image"
          defaultValue={user.image ?? ""}
          onChange={(e) => setPreview(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <fieldset className="border-t border-gray-700 pt-4">
        <legend className="text-sm font-medium text-slate-700">Address</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <input
            name="addressLine1"
            defaultValue={address?.line1 ?? ""}
            placeholder="Address line 1"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="addressLine2"
            defaultValue={address?.line2 ?? ""}
            placeholder="Address line 2"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="city"
            defaultValue={address?.city ?? ""}
            placeholder="City"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="postalCode"
            defaultValue={address?.postalCode ?? ""}
            placeholder="Postal code"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="country"
            defaultValue={address?.country ?? ""}
            placeholder="Country"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </fieldset>

      <div className="pt-4">
        <div className="flex items-center gap-2 mt-4">
          <SaveButton />
        </div>
      </div>
    </form>
  );
}
