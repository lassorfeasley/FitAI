import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setErrorMessage("");
      setSuccessMessage("Check your email to confirm your account.");
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setSuccessMessage("");
      console.error("Signup error:", error);
    },
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    signupMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="flex flex-col gap-5 p-5">
          {/* Header row */}
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="text-slate-600 text-xl font-medium font-['Space_Grotesk'] leading-9">
              Create an account
            </div>
            <div
              className="text-slate-600 text-sm font-normal font-['Space_Grotesk'] leading-tight cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log in
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
                id="create-account-email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={signupMutation.isPending}
                className="w-full bg-white"
              />
            </div>
          </div>
          {/* Password field label */}
          <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
            <div className="text-slate-600 text-sm font-bold font-['Space_Grotesk'] leading-tight">
              Password
            </div>
            <div className="mb-4 w-full">
              <Input
                type="password"
                id="create-account-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={signupMutation.isPending}
                className="w-full bg-white"
              />
            </div>
          </div>
          {signupMutation.error && (
            <div className="text-red-500 text-sm font-bold font-['Space_Grotesk'] leading-tight">
              {errorMessage}
            </div>
          )}
          {/* Create Account button */}
          <Button
            type="submit"
            data-layer="Button"
            disabled={signupMutation.isPending}
            className="w-full h-[56px]"
            onClick={handleSignup}
          >
            {signupMutation.isPending
              ? "Creating Account..."
              : "Create Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
