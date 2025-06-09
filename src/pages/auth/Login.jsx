import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setErrorMessage("");
      navigate("/");
    },
    onError: (error) => {
      const msg = error.message.toLowerCase();
      setErrorMessage(error.message);
      console.error("Login error:", error);
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="flex flex-col gap-5 p-5">
          {/* Header row */}
          <div className="flex justify-between items-center">
            <div className="text-slate-600 text-xl font-medium font-['Space_Grotesk'] leading-9">
              Login to your account
            </div>
            <div
              className="text-slate-600 text-sm font-normal font-['Space_Grotesk'] leading-tight cursor-pointer"
              onClick={() => navigate("/create-account")}
            >
              Sign up
            </div>
          </div>
          {/* Email field label */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="flex-1 text-slate-600 text-sm font-bold font-['Space_Grotesk'] leading-tight">
              Email
            </div>
            <div className="mb-4 w-full">
              <Input
                type="email"
                id="login-email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                className={`w-full bg-white${
                  loginMutation.error ? " border-red-500" : ""
                }`}
              />
            </div>
          </div>
          {/* Password field label and forgot link */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="w-full flex justify-between items-start">
              <div className="text-slate-600 text-sm font-bold font-['Space_Grotesk'] leading-tight">
                Password
              </div>
              <div
                className="text-slate-600 text-sm font-normal font-['Space_Grotesk'] leading-tight cursor-pointer"
                onClick={() => navigate("/reset-password")}
              >
                Forgot your password?
              </div>
            </div>
            <div className="mb-4 w-full">
              <Input
                type="password"
                id="login-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className={`w-full bg-white${
                  loginMutation.error ? " border-red-500" : ""
                }`}
              />
            </div>
          </div>
          {loginMutation.error && (
            <div className="text-red-500 text-sm font-bold font-['Space_Grotesk'] leading-tight">
              {errorMessage}
            </div>
          )}
          {/* Login button */}
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            onClick={handleLogin}
            className="w-full h-[56px]"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
