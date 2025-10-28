import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="flex flex-col items-center justify-center gap-2 px-16">
      <h1 className="inline-flex flex-row items-center justify-center text-4xl">
        Anilist Tools
      </h1>
      <p>This site is currently a work-in-progress.</p>
    </main>
  );
}
