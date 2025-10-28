import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import "./index.css";
import { enableMapSet } from "immer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IconContext } from "react-icons";

enableMapSet();

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <IconContext value={{}}>
          <RouterProvider router={router} />
        </IconContext>
      </QueryClientProvider>
    </StrictMode>,
  );
}
