type MutationContext = { userId: string };
export type MutationHandler<TMutationName extends string> = {
  mutationName: TMutationName;
  handler: (mutationArgs: unknown, ctx: MutationContext) => Promise<void>;
};

type MutationHandlerBuilder<TMutationName extends string, TArgs = unknown> = {
  validate<TValidated>(
    validationFn: (args: unknown) => TValidated,
  ): MutationHandlerBuilder<TMutationName, TValidated>;
  handler(
    handler: (args: { args: TArgs; ctx: MutationContext }) => Promise<void>,
  ): MutationHandler<TMutationName>;
};

export function createMutationHandler<
  TMutationName extends string,
  TArgs = unknown,
>(mutationName: TMutationName): MutationHandlerBuilder<TMutationName, TArgs> {
  let validateFn: (args: unknown) => TArgs = (args) => args as TArgs;

  return {
    validate<TValidated>(validationFn: (args: unknown) => TValidated) {
      validateFn = validationFn as any;
      return this as unknown as MutationHandlerBuilder<
        TMutationName,
        TValidated
      >;
    },
    handler(cb) {
      return {
        mutationName,
        handler: (args: unknown, ctx: MutationContext) => {
          return cb({ args: validateFn(args), ctx });
        },
      };
    },
  };
}
