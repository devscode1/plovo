import type { PropsWithChildren } from "react";

import { Sidebar } from "../_components/sidebar";

const OrganizationLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="pt-16 md:pt-24 px-2 md:px-4 max-w-6xl 2xl:max-w-screen-xl mx-auto">
      <div className="flex gap-x-7">
        <div className="w-56 shrink-0 hidden md:block">
          <Sidebar />
        </div>
        {children}
      </div>
    </main>
  );
};

export default OrganizationLayout;
