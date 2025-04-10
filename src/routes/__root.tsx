import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import {
  ClerkProvider,
  SignInButton,
  useAuth,
} from "@clerk/tanstack-react-start";
import { ReplicacheProvider } from "~/components/Replicache";
import { PropsWithChildren } from "react";
import { Tooltip } from "radix-ui";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "RepliChat | A local-first LLM chat",
        description: `RepliChat is a local-first chat app.`,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  ssr: false,
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: () => {
    return (
      <RootDocument>
        <RootComponent />
      </RootDocument>
    );
  },
});

function LoginPage() {
  return (
    <main className="h-screen flex items-center justify-center">
      <SignInButton />
    </main>
  );
}

function ClientOnly({ children }: PropsWithChildren) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <>{children}</> : null;
}

function RootComponent() {
  const auth = useAuth();
  return (
    <>
      {auth.userId == null ? (
        <div>
          <LoginPage />
        </div>
      ) : (
        <ClientOnly>
          <ReplicacheProvider userId={auth.userId}>
            <Outlet />
          </ReplicacheProvider>
        </ClientOnly>
      )}
    </>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          <Tooltip.Provider>{children}</Tooltip.Provider>
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  );
}
