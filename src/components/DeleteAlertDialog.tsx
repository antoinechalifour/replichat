import { ComponentProps, ReactNode } from "react";
import { AlertDialog } from "radix-ui";
import { Button } from "~/components/Button";

export function DeleteAlertDialog({
  title,
  description,
  onConfirm,
  ...props
}: {
  title: string;
  description: ReactNode;
  onConfirm: () => void;
} & ComponentProps<typeof AlertDialog.Root>) {
  return (
    <AlertDialog.Root {...props}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl w-full max-w-md">
            <AlertDialog.Title className="p-6 text-lg font-semibold border-b border-black/10">
              {title}
            </AlertDialog.Title>
            <div className="p-6">
              <AlertDialog.Description>{description}</AlertDialog.Description>

              <footer className="flex justify-end items-center gap-3 pt-6">
                <AlertDialog.Cancel asChild>
                  <Button variant="secondary" type="button">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild onClick={onConfirm}>
                  <Button variant="danger" type="button">
                    Delete
                  </Button>
                </AlertDialog.Action>
              </footer>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
