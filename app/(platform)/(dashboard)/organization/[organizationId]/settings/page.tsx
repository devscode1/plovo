import { AdminManager } from "./_components/admin-manager";
import { getAuthContext } from "@/lib/firebase/auth-helpers";
import { getWorkspaceMembers } from "@/lib/firebase/workspaces";

const SettingsPage = async ({ params }: { params: Promise<{ organizationId: string }> }) => {
  const { organizationId } = await params;
  const members = await getWorkspaceMembers(organizationId);

  return (
    <div className="w-full">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Workspace Settings</h2>
        <p className="text-muted-foreground">
          Manage your workspace settings and preferences.
        </p>

        <AdminManager />

        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Workspace Members</h3>
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">{member.displayName} ({member.email})</p>
                  <p className="text-xs text-muted-foreground capitalize">Role: {member.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
