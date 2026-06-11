"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, Lock, Camera } from "lucide-react";
import { updateEmail, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

function AccountSettingsForm() {
  const router = useRouter();
  const { user, profile, updateProfile: updateFirebaseProfile, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await updateFirebaseProfile({
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
      });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (user) {
        await updateEmail(user, email);
        setSuccess("Email updated successfully");
      }
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === "auth/requires-recent-login") {
        setError("Please sign in again to change your email.");
      } else if (errorCode === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else {
        setError("Failed to update email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (user && currentPassword) {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess("Password updated successfully");
      }
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === "auth/requires-recent-login" || errorCode === "auth/wrong-password") {
        setError("Current password is incorrect. Please try again.");
      } else if (errorCode === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    if (!currentPassword) {
      setError("Please enter your current password to confirm account deletion.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (user) {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);
        document.cookie = "__session=; path=/; max-age=0";
        router.push("/");
      }
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === "auth/requires-recent-login" || errorCode === "auth/wrong-password") {
        setError("Current password is incorrect. Please try again.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
      setLoading(false);
    }
  };

  const initials = profile?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0].toUpperCase() || "U";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </h2>
          <Separator />

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={photoURL} alt={profile?.displayName || "User"} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="photoURL">Profile Photo URL</Label>
                <Input
                  id="photoURL"
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">Enter a URL to your profile image</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={saving}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </h2>
          <Separator />

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="new@example.com"
                disabled={loading}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Changing your email will require you to verify the new address.
            </p>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Email"
              )}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </h2>
          <Separator />

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </section>

        <section className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-medium flex items-center gap-2 text-destructive">
            <User className="h-4 w-4" />
            Danger Zone
          </h2>
          <Separator />

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Current Password (required)</Label>
              <Input
                id="deletePassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                disabled={loading}
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 pt-20">
      <AccountSettingsForm />
    </div>
  );
}