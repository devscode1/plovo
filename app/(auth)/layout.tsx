import { AuthProvider } from "@/lib/firebase/auth-context";
import { WorkspaceProvider } from "@/lib/firebase/workspace-context";
import { BackButton } from "@/components/back-button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <div className="relative h-full">
          <div className="absolute top-4 left-4 z-50">
            <BackButton />
          </div>
          {children}
        </div>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
