import { ComponentProps } from "react";
import { AlertDialog as BaseAlertDialog } from "radix-ui";
import { Button } from "~/components/Button";

export function AlertDialog({
  title,
  children,
  confirmText,
  onConfirm,
  confirmDisabled,
  variant = "default",
  noCancel,
  ...props
}: {
  title: string;
  variant?: "default" | "danger";
  confirmText: string;
  confirmDisabled?: boolean;
  onConfirm(): void;
  noCancel?: true;
} & ComponentProps<typeof BaseAlertDialog.Root>) {
  return (
    <BaseAlertDialog.Root {...props}>
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <BaseAlertDialog.Content className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl w-full max-w-md">
            <BaseAlertDialog.Title className="p-6 text-lg font-semibold border-b border-black/10">
              {title}
            </BaseAlertDialog.Title>
            <div className="p-6 text-sm text-gray-800">
              {children}

              <footer className="flex justify-end items-center gap-3 pt-6">
                {!noCancel && (
                  <BaseAlertDialog.Cancel asChild>
                    <Button variant="secondary" type="button">
                      Cancel
                    </Button>
                  </BaseAlertDialog.Cancel>
                )}
                <BaseAlertDialog.Action asChild onClick={onConfirm}>
                  <Button
                    variant={variant}
                    type="button"
                    disabled={confirmDisabled}
                  >
                    {confirmText}
                  </Button>
                </BaseAlertDialog.Action>
              </footer>
            </div>
          </div>
        </BaseAlertDialog.Content>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}
