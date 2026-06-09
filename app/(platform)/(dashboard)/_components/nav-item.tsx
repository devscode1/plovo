"use client";

import Image from "next/image";
import { BarChart, CreditCard, Layout, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

export type Organization = {
  id: string;
  slug: string;
  imageUrl: string;
  name: string;
};

type NavItemProps = {
  isExpanded: boolean;
  isActive: boolean;
  organization: Organization;
  onExpand: (id: string) => void;
};

export const NavItem = ({
  isExpanded,
  isActive,
  organization,
  onExpand,
}: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const routes = [
    {
      label: "Boards",
      icon: <Layout className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}`,
    },

    {
      label: "Dashboard",
      icon: <BarChart className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}/admin`,
      adminOnly: true,
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}/settings`,
      adminOnly: true,
    },
    {
      label: "Billing",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}/billing`,
    },
  ];

  const visibleRoutes = routes.filter(r => !r.adminOnly || (organization as any).role === "admin" || (organization as any).role === "owner");

  const onClick = (href: string) => {
    router.push(href);
  };

  return (
    <AccordionItem value={organization.id} className="border-none">
       <AccordionTrigger
         onClick={() => onExpand(organization.id)}
         className={cn(
           "flex items-center gap-x-2 p-1.5 text-neutral-700 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
           isActive && !isExpanded && "bg-sky-500/10 text-sky-700"
         )}
       >
         <div className="flex items-center gap-x-2">
           <div className="w-7 h-7 relative bg-sky-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
             {organization.imageUrl ? (
               <Image
                 src={organization.imageUrl}
                 height={28}
                 width={28}
                 alt={`organization ${organization.name}'s image`}
                 className="rounded-sm object-cover"
               />
             ) : (
               organization.name.charAt(0).toUpperCase()
             )}
           </div>
           <span className="font-medium text-sm">{organization.name}</span>
         </div>
       </AccordionTrigger>
      <AccordionContent className="pt-1 text-neutral-700">
        {visibleRoutes.map((route) => (
          <Button
            key={route.label}
            size="sm"
            onClick={() => onClick(route.href)}
            className={cn(
              "w-full font-normal justify-start pl-10  mb-1",
              pathname === route.href && "bg-primary/10 text-primary"
            )}
            variant="ghost"
          >
            {route.icon}
            {route.label}
          </Button>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

NavItem.Skeleton = function SkeletonNavItem() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="w-10 h-10 relative shrink-0">
        <Skeleton className="h-full w-full absolute" />
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
};
