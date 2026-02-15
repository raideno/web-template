import "@radix-ui/themes/styles.css";

import { ReloadIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Skeleton,
  Theme,
} from "@radix-ui/themes";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { QueryClient } from "@tanstack/react-query";

import type { AuthenticationContextType } from "@/contexts/tanstack/authentication";
import type { OnboardingsContextType } from "@/contexts/tanstack/onboardings";
import type { SubscriptionContextType } from "@/contexts/tanstack/subscription";
import type { UserContextType } from "@/contexts/tanstack/user";

import { loadAuthenticationContext } from "@/contexts/tanstack/authentication";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import {
  PageHeaderCard,
  PageHeaderCardSkeleton,
} from "@/components/layout/page-header-card";
import {
  AlertDialogProvider,
  useConfirm,
} from "@/components/providers/confirmation-dialog";
import { ACCENT_COLOR, DEFAULT_THEME } from "@/contexts/react/theme";
import { cn } from "@/lib/utils";

export interface RouteContext {
  queryClient: QueryClient;
  user: UserContextType;
  authentication: AuthenticationContextType;
  subscription: SubscriptionContextType;
  onboardings: OnboardingsContextType;
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Theme accentColor={ACCENT_COLOR} appearance={DEFAULT_THEME}>
      <AlertDialogProvider>
        <div
          className={cn(
            "min-h-screen grid grid-rows-[auto_1fr_auto] h-full max-w-3xl",
            "px-4 mx-auto space-y-4 py-4",
            "border-x border-x-(--gray-7)",
            DEFAULT_THEME === "light" && "bg-[#f9f9f8]",
            DEFAULT_THEME === "dark" && "bg-[#171918]",
          )}
        >
          <Navbar />
          {children}
          <Footer />
        </div>
      </AlertDialogProvider>
    </Theme>
  );
};

export const Route = createRootRouteWithContext<RouteContext>()({
  beforeLoad: async () => {
    const [authentication] = await Promise.all([loadAuthenticationContext()]);

    return {
      authentication,
    };
  },
  shellComponent: ({ children }) => {
    return <Layout>{children}</Layout>;
  },
  errorComponent: ({ error }) => {
    const router = useRouter();
    const confirm = useConfirm();

    return (
      <Container size="4">
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="An error occurred"
            description={
              error.message ||
              "Please try refreshing the page or clearing site data."
            }
          />
          <Card size={"4"} className="p-0!">
            <Box p={"4"}>
              <Flex direction="column" gap="2" align="center">
                <Button
                  className="w-full!"
                  variant="outline"
                  color="gray"
                  onClick={() => {
                    router.invalidate();
                  }}
                >
                  <ReloadIcon />
                  Refresh
                </Button>

                <Button
                  variant="classic"
                  className="w-full!"
                  color="red"
                  onClick={async () => {
                    const result = await confirm({
                      title: "Clear Site Data",
                      body: "Are you sure you want to clear all site data? This will log you out and remove all local data.",
                      actionButton: "Clear Data",
                    });

                    if (result) {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = "/";
                    }
                  }}
                >
                  <TrashIcon />
                  Clear Data
                </Button>
              </Flex>
            </Box>
          </Card>
        </Flex>
      </Container>
    );
  },
  notFoundComponent: () => <div>404 - Page Not Found</div>,
  pendingComponent: () => (
    <Layout>
      <Box className="grid! grid-rows-[auto_1fr] gap-4">
        <PageHeaderCardSkeleton />
        <Skeleton className="h-full!" />
      </Box>
    </Layout>
  ),
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
