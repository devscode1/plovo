import { getAdminDb } from "@/lib/firebase/admin";

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: "owner" | "admin" | "member";
  createdAt: Date;
}

export async function createWorkspace(
  userId: string,
  email: string,
  displayName: string
): Promise<Workspace> {
  const name = `${displayName}'s Workspace`;
  const slug = `${displayName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

  const workspaceData = {
    name,
    ownerId: userId,
    slug,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const workspaceRef = await getAdminDb().collection("workspaces").add(workspaceData);

  await getAdminDb().collection("workspaces").doc(workspaceRef.id).collection("members").add({
    workspaceId: workspaceRef.id,
    userId,
    email,
    displayName,
    photoURL: null,
    role: "owner",
    createdAt: new Date(),
  });

  return { id: workspaceRef.id, ...workspaceData };
}

export async function getWorkspaces(userId: string): Promise<Workspace[]> {
  const membersSnapshot = await getAdminDb()
    .collectionGroup("members")
    .where("userId", "==", userId)
    .get();

  const workspaceIds = membersSnapshot.docs.map((doc) => doc.data().workspaceId);

  if (workspaceIds.length === 0) return [];

  const workspacesSnapshot = await getAdminDb()
    .collection("workspaces")
    .where("__name__", "in", workspaceIds.slice(0, 10))
    .get();

  return workspacesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Workspace[];
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const doc = await getAdminDb().collection("workspaces").doc(workspaceId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Workspace;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const snapshot = await getAdminDb()
    .collection("workspaces")
    .doc(workspaceId)
    .collection("members")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as WorkspaceMember[];
}

export async function isWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
  const snapshot = await getAdminDb()
    .collection("workspaces")
    .doc(workspaceId)
    .collection("members")
    .where("userId", "==", userId)
    .limit(1)
    .get();

  return !snapshot.empty;
}

export async function getUserRole(workspaceId: string, userId: string): Promise<string | null> {
  const snapshot = await getAdminDb()
    .collection("workspaces")
    .doc(workspaceId)
    .collection("members")
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data().role;
}
