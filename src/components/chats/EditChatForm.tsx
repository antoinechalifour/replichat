import clsx from "clsx";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { useReplicache } from "~/components/Replicache";

export function EditChatForm({
  chat,
  onDone,
}: {
  chat: ChatViewModel;
  onDone(): void;
}) {
  const r = useReplicache();
  const form = useForm({
    defaultValues: { title: chat.title },
    validators: {
      onChange: z.object({ title: z.string().min(1, "Title is required") }),
    },
    onSubmit: async ({ value }) => {
      await r.mutate.updateChat({
        id: chat.id,
        updates: { title: value.title },
      });
      onDone();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        return form.handleSubmit();
      }}
      className="-m-2 grow p-1 rounded-lg"
    >
      <form.Field name="title">
        {(field) => (
          <input
            type="text"
            aria-label="New chat name"
            placeholder="Enter the name"
            data-form-type="other"
            name={field.name}
            value={field.state.value}
            onBlur={() => {
              field.handleBlur();
              const errors = field.state.meta.errors;
              if (errors.length > 0) {
                onDone();
                return;
              }
              return form.handleSubmit();
            }}
            onChange={(e) => field.handleChange(e.target.value)}
            className={clsx("bg-transparent block w-full p-1 rounded-lg")}
            ref={(node) => node?.focus()}
          />
        )}
      </form.Field>
    </form>
  );
}
