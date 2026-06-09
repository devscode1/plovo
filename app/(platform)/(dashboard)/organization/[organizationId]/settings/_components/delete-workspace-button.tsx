"use client";

import { useAction } from "@/hooks/use-action";
import { deleteWorkspace } from "@/actions/delete-workspace";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DeleteWorkspaceButton = () => {
  const params = useParams();
  const router = useRouter();
  const orgId = params.organizationId as string;

  const { execute, isLoading } = useAction(deleteWorkspace, {
    onSuccess: () => {
      toast.success("Workspace deleted successfully.");
      router.push("/select-workspace");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onConfirm = () => {
    execute({ id: orgId });
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Permanently delete this workspace, including all of its boards, lists, cards, and members. This action cannot be undone.
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Workspace"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workspace
              and remove all of its boards, lists, cards, and members from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Yes, delete workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
