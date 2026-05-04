import { Separator } from "@/components/ui/separator";

import { Info } from "../_components/info";
import { SubscriptionButton } from "./_components/subscription-button";

const BillingPage = async () => {
  return (
    <div className="w-full">
      <Info />
      <Separator className="my-2" />
      <div className="flex items-center justify-center flex-col gap-y-2">
        <p className="text-muted-foreground">Billing settings</p>
        <SubscriptionButton isPro={true} />
      </div>
    </div>
  );
};

export default BillingPage;
