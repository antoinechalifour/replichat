import { z } from "zod";
import clsx from "clsx";
import { useForm } from "@tanstack/react-form";
import { AlertDialog } from "~/components/AlertDialog";

const FormSchema = z.object({
  apiKey: z.string().min(1, "An API key is required"),
});

export function SetupApiKeyAlertDialog() {
  const form = useForm({
    defaultValues: {
      apiKey: "",
    },
    validators: {
      onMount: FormSchema,
      onChange: FormSchema,
    },

    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) => (
        <AlertDialog
          open
          noCancel
          title="Let's Get Started!"
          confirmText="Save & Continue"
          confirmDisabled={!canSubmit}
          onConfirm={() => {
            console.log("BOOM !");
          }}
        >
          <p className="text-sm mb-4">
            Welcome aboard! To unlock our full suite of features, please enter
            your OpenAI API key below. Your key is kept secure and private.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              return form.handleSubmit();
            }}
          >
            <form.Field name="apiKey">
              {(field) => (
                <div>
                  <label htmlFor={field.name} className="flex flex-col gap-1">
                    <span className="font-semibold text-xs">
                      OpenAI API Key
                    </span>
                    <input
                      type="text"
                      placeholder="Paste your API key here..."
                      className={clsx(
                        "border transition-colors rounded-md px-3 py-2",
                        {
                          "border-gray-200":
                            field.state.meta.errors.length === 0,
                          "border-red-600":
                            field.state.meta.errors.length !== 0,
                        },
                      )}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </label>
                  {field.state.meta.errors[0] != null && (
                    <p className="text-red-600 text-xs mt-1">
                      {field.state.meta.errors[0].message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </form>
        </AlertDialog>
      )}
    </form.Subscribe>
  );
}
