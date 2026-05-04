import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/lib/firebase/auth-context";
import { WorkspaceProvider } from "@/lib/firebase/workspace-context";
import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const PlatformLayout = ({ children }: PropsWithChildren) => {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <QueryProvider>
          <Toaster />
          <ModalProvider />
          {children}
        </QueryProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
};

export default PlatformLayout;
