import Link from "next/link";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/back-button";

export const Navbar = () => {
  return (
    <div className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center">
      <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
        <div className="flex items-center gap-x-2">
          <BackButton />
          <Logo />
        </div>

        <div className="space-x-4 flex items-center justify-between w-auto">
          <Link
            href="/sign-in"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Sign in
          </Link>

          <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
