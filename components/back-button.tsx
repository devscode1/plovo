"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="ghost"
      size="sm"
      className="gap-x-1"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  );
};
