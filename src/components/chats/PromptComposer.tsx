import { useForm } from "@tanstack/react-form";
import { Icon } from "~/components/Icon";
import { ArrowRightIcon } from "lucide-react";

export function PromptComposer({
  autofocus = false,
  onSubmit,
}: {
  autofocus?: boolean;
  onSubmit: (message: string) => Promise<void>;
}) {
  const form = useForm({
    defaultValues: { message: "" },
    onSubmit: async ({ value }) => {
      await onSubmit(value.message);
      form.reset();
    },
  });

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-[28px] overflow-hidden shadow-xl w-full focus-within:border-slate-300 transition-all">
      <form
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          return form.handleSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) {
            e.preventDefault();
            return form.handleSubmit();
          }
        }}
      >
        <form.Field name="message">
          {(field) => (
            <textarea
              autoFocus={autofocus}
              className="px-3.5 py-0.5 grow resize-none focus:outline-0 field-sizing-content max-h-52 overflow-y-auto"
              rows={2}
              placeholder="Ask anything"
              aria-label="Ask anything"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <button className="self-end bg-black hover:bg-gray-700 transition-colors text-white rounded-full p-2 aspect-square flex items-center justify-center">
          <Icon as={ArrowRightIcon} className="!text-current" />
        </button>
      </form>
    </div>
  );
}
