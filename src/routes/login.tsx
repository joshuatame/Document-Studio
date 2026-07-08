import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAccessToken } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter an access token");
      return;
    }
    setLoading(true);
    setAccessToken(token);
    toast.success("Access token saved");
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-steel/20 p-4">
      <Card className="w-full max-w-md" padding="lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy">
            <span className="text-lg font-bold text-white">TD</span>
          </div>
          <CardTitle className="text-2xl">Document Studio</CardTitle>
          <CardDescription>
            AI-powered document generation by Tame Dynamics
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token" required>
              Access Token
            </Label>
            <Input
              id="token"
              type="password"
              placeholder="Paste your access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="rounded-lg border border-alert/30 bg-alert/5 px-4 py-3 text-sm text-graphite">
            Temporary login for integration testing. This will be replaced with
            Tame Platform authentication.
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
