import { useState, useCallback } from "react";
import TerminalBanner from "@components/shared/common/TerminalBanner.tsx";
import FormInput from "@components/shared/form/FormInput.tsx";
import SubmitButton from "@components/shared/form/SubmitButton.tsx";
import {
  LoginRequest,
  useLoginMutation,
} from "@hooks/users/auth/useLoginMutation.ts";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess } from "@utils/toast.utils.tsx";
import Form from "@components/shared/form/Form.tsx";

/**
 * LoginForm Component
 *
 * A form component for user login supporting an optional TOTP second factor.
 *
 * @component
 */
const LoginForm = () => {
  const mutation = useLoginMutation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const handleSubmit = useCallback(async () => {
    const loginRequest: LoginRequest = {
      email,
      password,
      twoFactorCode: requiresTwoFactor ? twoFactorCode : null,
    };

    try {
      const response = await mutation.mutateAsync(loginRequest);

      if (response.data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setTwoFactorCode("");
        return;
      }

      toastSuccess("Login successful");
      navigate("/");
    } catch {
      toastError(
        requiresTwoFactor
          ? "Invalid authentication code"
          : "Login failed"
      );
    }
  }, [mutation, email, password, twoFactorCode, requiresTwoFactor, navigate]);

  return (
    <div className="bg-white px-4 py-5 rounded-lg border-[1px] border-black/15 max-w-3xl w-full">
      <div className="flex gap-5 h-full">
        <div className="w-full flex-col gap-3 hidden sm:flex">
          <div className="border-[1px] [background-size:16px_16px] h-full flex justify-center items-center border-black/15 rounded-md bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]">
            <TerminalBanner />
          </div>
        </div>
        <div className="w-full h-full">
          <div className="py-8 w-full">
            <p className="text-2xl font-normal text-center">
              {requiresTwoFactor ? "Two-factor authentication" : "Welcome back"}
            </p>
            <p className="text-sm font-normal text-center text-gray-600">
              {requiresTwoFactor
                ? "Enter the 6-digit code from your authenticator app"
                : "Sign in to your account"}
            </p>
          </div>
          <Form
            handleSubmit={handleSubmit}
            className="w-full h-full flex flex-col gap-3"
          >
            <div className="flex flex-col">
              {!requiresTwoFactor ? (
                <>
                  <FormInput
                    name="email"
                    type="email"
                    label="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FormInput
                    name="password"
                    type="password"
                    label="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </>
              ) : (
                <FormInput
                  name="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  label="Authentication code"
                  required
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  autoFocus
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <SubmitButton
                label={requiresTwoFactor ? "Verify code" : "Sign in"}
                isLoading={mutation.isPending}
                dark
              />
              {requiresTwoFactor ? (
                <button
                  type="button"
                  className="text-xs text-gray-600 hover:text-black"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    setTwoFactorCode("");
                  }}
                >
                  Back to email and password
                </button>
              ) : (
                <p className="text-xs p-0 font-normal text-center text-gray-600">
                  Don&apos;t have an account? Ask for an invitation
                </p>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
