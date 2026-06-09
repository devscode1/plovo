"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  slug: string;
  role?: string; // "owner" | "admin" | "member"
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
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

  const fetchWorkspaces = useCallback(async (): Promise<Workspace[]> => {
    try {
      const res = await fetch("/api/workspaces");
      if (!res.ok) return [];
      const data: Workspace[] = await res.json();
      setWorkspaces(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
      return [];
    }
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    await fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const fetched = await fetchWorkspaces();

      const activeId = getActiveWorkspaceId();
      const active = fetched.find((w) => w.id === activeId) || fetched[0] || null;

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

    // Re-fetch from server to get correct data with role
    const updated = await fetchWorkspaces();
    const newWorkspace = updated.find((w) => w.id === docRef.id) || {
      id: docRef.id,
      ...workspaceData,
      role: "owner",
    };

    setActiveWorkspaceState(newWorkspace);
    setActiveWorkspaceId(newWorkspace.id);

    return newWorkspace;
  }, [user, fetchWorkspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading: loading || authLoading,
        setActiveWorkspace,
        createWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
