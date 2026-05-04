"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  slug: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({} as WorkspaceContextType);

export const useWorkspace = () => useContext(WorkspaceContext);

function getActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeWorkspaceId");
}

function setActiveWorkspaceId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem("activeWorkspaceId", id);
  } else {
    localStorage.removeItem("activeWorkspaceId");
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async (userId: string) => {
    const membersRef = collection(db, "workspaces");
    const q = query(membersRef, where("ownerId", "==", userId));

    const memberDocs = await getDocs(q);
    const workspacePromises = memberDocs.docs.map(async (docSnapshot) => {
      const workspaceRef = doc(db, "workspaces", docSnapshot.id);
      const workspaceSnap = await getDoc(workspaceRef);
      if (workspaceSnap.exists()) {
        return { id: workspaceSnap.id, ...workspaceSnap.data() } as Workspace;
      }
      return null;
    });

    const workspaces = (await Promise.all(workspacePromises)).filter(Boolean) as Workspace[];
    setWorkspaces(workspaces);
    return workspaces;
  }, []);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      const workspaces = await fetchWorkspaces(user.uid);

      const activeId = getActiveWorkspaceId();
      const active = workspaces.find((w) => w.id === activeId) || workspaces[0] || null;

      setActiveWorkspaceState(active);
      setActiveWorkspaceId(active?.id || null);
      setLoading(false);
    };

    load();
  }, [user, fetchWorkspaces]);

  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    setActiveWorkspaceId(workspace.id);
  }, []);

  const createWorkspace = useCallback(async (name: string): Promise<Workspace> => {
    if (!user) throw new Error("Not authenticated");

    const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const workspaceData = {
      name,
      ownerId: user.uid,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "workspaces"), workspaceData);

    await addDoc(collection(db, `workspaces/${docRef.id}/members`), {
      workspaceId: docRef.id,
      userId: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || null,
      role: "owner",
      createdAt: new Date(),
    });

    const newWorkspace = { id: docRef.id, ...workspaceData };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setActiveWorkspaceState(newWorkspace);
    setActiveWorkspaceId(newWorkspace.id);

    return newWorkspace;
  }, [user]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading: loading || authLoading,
        setActiveWorkspace,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
