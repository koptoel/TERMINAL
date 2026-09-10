import { useEffect, useState } from "react";
import { DialogComp } from "@components/shared/dialog/DialogComp.tsx";
import { DialogSubmitButton } from "@components/shared/dialog/DialogSubmitButton.tsx";
import FormInput from "@components/shared/form/FormInput.tsx";
import { useSetupTwoFactor } from "@hooks/users/auth/useSetupTwoFactor.ts";
import { useEnableTwoFactor } from "@hooks/users/auth/useEnableTwoFactor.ts";
import { toastError, toastSuccess } from "@utils/toast.utils.tsx";

export interface TwoFactorDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TwoFactorDialog = ({ open, setOpen }: TwoFactorDialogProps) => {
  const setupMutation = useSetupTwoFactor();
  const enableMutation = useEnableTwoFactor();
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!open) {
      setSecret("");
      setOtpauthUrl("");
      setCode("");
      setupMutation.reset();
      enableMutation.reset();
    }
  }, [open]);

  const handleSetup = async () => {
    try {
      const response = await setupMutation.mutateAsync();
      setSecret(response.data.secret);
      setOtpauthUrl(response.data.otpauthUrl);
      toastSuccess("2FA setup started");
    } catch {
      toastError("Failed to start 2FA setup");
    }
  };

  const handleEnable = async () => {
    if (code.length !== 6) return;

    try {
      await enableMutation.mutateAsync(code);
      toastSuccess("Two-factor authentication enabled");
      setOpen(false);
    } catch {
      toastError("Invalid authentication code");
    }
  };

  return (
    <DialogComp
      isOpen={open}
      setIsOpen={setOpen}
      title="Two-factor authentication"
    >
      {!secret ? (
        <>
          <p className="text-sm text-gray-600">
            Add an extra security step to your account using Google Authenticator
            or another TOTP authenticator app.
          </p>
          <DialogSubmitButton
            onClick={handleSetup}
            isSubmitting={setupMutation.isPending}
          >
            Set up 2FA
          </DialogSubmitButton>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Authenticator secret</p>
            <div className="rounded-md border bg-gray-50 p-3 break-all font-mono text-sm select-all">
              {secret}
            </div>
            <p className="text-xs text-gray-500">
              In Google Authenticator choose to enter a setup key and paste this secret.
            </p>
          </div>

          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer">Show otpauth URI</summary>
            <div className="mt-2 rounded-md border bg-gray-50 p-2 break-all font-mono select-all">
              {otpauthUrl}
            </div>
          </details>

          <FormInput
            label="6-digit authentication code"
            name="twoFactorCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            minLength={6}
            maxLength={6}
            pattern="[0-9]{6}"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />

          <DialogSubmitButton
            disabled={code.length !== 6}
            onClick={handleEnable}
            isSubmitting={enableMutation.isPending}
          >
            Verify and enable 2FA
          </DialogSubmitButton>
        </>
      )}
    </DialogComp>
  );
};

export default TwoFactorDialog;
