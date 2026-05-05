"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, displayName);
      const redirectUrl = searchParams.get("redirectUrl") || "/select-workspace";
      router.push(redirectUrl);
    } catch {
      setError("Failed to create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Full Name</Label>
          <Input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Sign up"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/sign-in${searchParams.get("redirectUrl") ? `?redirectUrl=${searchParams.get("redirectUrl")}` : ""}`} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-2xl font-bold text-foreground">Create your account</h2>
        </div>
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
