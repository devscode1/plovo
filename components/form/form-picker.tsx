"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { defaultBackgrounds, type BoardBackground } from "@/constants/images";
import { FormErrors } from "./form-errors";

type FormPickerProps = {
  id: string;
  errors?: Record<string, string[] | undefined>;
};

export const FormPicker = ({ id, errors }: FormPickerProps) => {
  const { pending } = useFormStatus();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-2 mb-2">
        {defaultBackgrounds.map((bg: BoardBackground) => (
          <div
            key={bg.id}
            className={cn(
              "relative aspect-video group hover:opacity-75 transition cursor-pointer rounded-sm overflow-hidden",
              pending && "opacity-50 cursor-auto"
            )}
            onClick={() => {
              if (pending) return;
              setSelectedImageId(bg.id);
            }}
          >
            <input
              aria-hidden
              type="radio"
              id={id}
              name={id}
              className="hidden"
              checked={selectedImageId === bg.id}
              onChange={() => {}}
              value={`${bg.id}|${bg.gradient}|${bg.gradient}|none|Plovo`}
              disabled={pending}
              aria-disabled={pending}
            />
            <div
              className="absolute inset-0 rounded-sm"
              style={{ background: bg.thumbGradient }}
            />

            {selectedImageId === bg.id && (
              <div className="absolute inset-y-0 h-full w-full bg-black/30 flex items-center justify-center z-10">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}

            <span className="opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 z-10">
              {bg.label}
            </span>
          </div>
        ))}
      </div>
      <FormErrors id="image" errors={errors} />
    </div>
  );
};
