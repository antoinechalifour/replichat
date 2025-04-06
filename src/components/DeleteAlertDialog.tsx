import { ComponentProps, ReactNode } from "react";
import { AlertDialog as BaseAlertDialog } from "radix-ui";
import { AlertDialog } from "~/components/AlertDialog";

export function DeleteAlertDialog({
  title,
  description,
  ...props
}: {
  title: string;
  description: ReactNode;
} & Omit<ComponentProps<typeof AlertDialog>, "confirmText">) {
  return (
    <AlertDialog title={title} confirmText="Delete" variant="danger" {...props}>
      <BaseAlertDialog.Description>{description}</BaseAlertDialog.Description>
    </AlertDialog>
  );
}
