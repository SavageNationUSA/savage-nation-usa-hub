import { useState } from "react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const Auth = () => {
  const { enabled, user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const action = mode === "signin" ? signIn : signUp;
    const { error } = await action(email, password);
    setLoading(false);
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else {
      toast({ title: "Success", description: mode === "signin" ? "Signed in" : "Account created. Check your email if confirmation is required." });
    }
  };

  return (
    <>
      <SEO title="Sign in — Savage Nation USA" description="Sign in or create an account to access Savage Nation USA." />
      <main className="container mx-auto py-12">
        {!enabled ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connect Supabase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>To enable login and accounts, connect your project to Supabase using the green Supabase button in the top-right.</p>
              <a className="underline text-primary" href="https://docs.lovable.dev/integrations/supabase/" target="_blank" rel="noreferrer">Read how to connect Supabase</a>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{mode === "signin" ? "Sign in" : "Create account"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" variant="default" disabled={loading}>
                  {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>
              <div className="mt-4 text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <span>
                    New here?{" "}
                    <button className="underline text-primary" onClick={() => setMode("signup")}>Create an account</button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button className="underline text-primary" onClick={() => setMode("signin")}>Sign in</button>
                  </span>
                )}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                By continuing, you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
};

export default Auth;
