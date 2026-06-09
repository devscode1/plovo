import { redirect } from "next/navigation";
import { AdminManager } from "./_components/admin-manager";
import { MemberManager } from "./_components/member-manager";
import { DeleteWorkspaceButton } from "./_components/delete-workspace-button";
import { MemberItem } from "./_components/member-item";
import { getAuthContext } from "@/lib/firebase/auth-helpers";
import { getWorkspaceMembers, requireAdminRole } from "@/lib/firebase/workspaces";

const SettingsPage = async ({ params }: { params: Promise<{ organizationId: string }> }) => {
  const { organizationId } = await params;
  const ctx = await getAuthContext();

  let isAdmin = false;
  try {
    if (ctx.userId) {
      isAdmin = await requireAdminRole(organizationId, ctx.userId);
    }
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    redirect(`/organization/${organizationId}`);
  }

  const members = await getWorkspaceMembers(organizationId);

  return (
    <div className="w-full">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Workspace Settings</h2>
        <p className="text-muted-foreground">
          Manage your workspace settings and preferences.
        </p>

        <AdminManager />
        <MemberManager />

        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Workspace Members</h3>
          <ul className="space-y-2">
            {members.map((member) => (
              <MemberItem 
                key={member.id} 
                member={member} 
                isCurrentUser={member.userId === ctx.userId}
              />
            ))}
          </ul>
        </div>
      </div>
      
      <div className="p-6 pt-0">
        <DeleteWorkspaceButton />
      </div>
    </div>
  );
};

export default SettingsPage;
