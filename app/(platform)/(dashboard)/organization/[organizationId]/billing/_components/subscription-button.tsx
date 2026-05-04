"use client";

import { Button } from "@/components/ui/button";

type SubscriptionButtonProps = {
  isPro: boolean;
};

export const SubscriptionButton = ({ isPro }: SubscriptionButtonProps) => {
  return (
    <Button disabled={false}>
      {isPro ? "Manage subscription" : "Upgrade to pro"}
    </Button>
  );
};
