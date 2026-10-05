import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat, LogIn, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_PASSWORD, DEMO_USERNAME, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — guestBTP" },
      { name: "description", content: "Sign in to guestBTP or continue as a guest to explore the construction billing demo." },
      { property: "og:title", content: "Sign in — guestBTP" },
      { property: "og:description", content: "Construction billing demo: sign in or explore as a guest." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginAsGuest, session, ready } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { if (ready && session) navigate({ to: "/", replace: true }); }, [ready, session, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) setError("Incorrect username or password.");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-secondary p-10 text-secondary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-sm bg-primary text-primary-foreground"><HardHat className="h-6 w-6" /></span>
          <span className="font-display text-2xl font-bold">guest<span className="text-primary">BTP</span></span>
        </div>
        <div>
          <h1 className="text-5xl font-bold uppercase leading-none">Billing built<br />for the <span className="text-primary">job site</span>.</h1>
          <p className="mt-4 max-w-md opacity-80">Quotes to invoices, HT to TTC, sent to paid — every invoice tracked, none ever deleted.</p>
        </div>
        <div className="hazard-stripe absolute inset-x-0 bottom-0 h-3" />
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>
            <span className="font-display text-2xl font-bold text-secondary">guest<span className="text-primary">BTP</span></span>
          </div>
          <h2 className="text-3xl font-bold uppercase text-secondary">Sign in</h2>
          <div className="mb-6 mt-2 h-1 w-14 bg-primary" />

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" autoComplete="username" required value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full"><LogIn /> Sign in</Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={loginAsGuest}><UserRound /> Continue as guest</Button>

          <div className="mt-8 rounded-sm border border-dashed bg-muted p-3 text-xs text-muted-foreground">
            Demo account: <span className="font-mono font-semibold text-foreground">{DEMO_USERNAME}</span> / <span className="font-mono font-semibold text-foreground">{DEMO_PASSWORD}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
