"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";

export const UserMenu = () => {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    document.cookie = "activeOrgId=; path=/; max-age=0";
    router.push("/");
  };

  if (!user) return null;

  const initials =
    profile?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user.email?.[0].toUpperCase() || "U";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="px-2 py-1.5 mb-1">
          <p className="text-sm font-medium">{profile?.displayName || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <div className="border-t pt-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-8 text-sm"
            onClick={() => {
              setOpen(false);
              router.push("/account-settings");
            }}
          >
            <Settings className="h-4 w-4" />
            Account settings
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-8 text-sm text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
