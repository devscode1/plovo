import { AuthProvider } from "@/lib/firebase/auth-context";
import { WorkspaceProvider } from "@/lib/firebase/workspace-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    </AuthProvider>
  );
}
