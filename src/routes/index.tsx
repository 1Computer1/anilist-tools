import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AniList Tools" },
      {
        name: "description",
        content: "Enhance your AniList experience with various tools!",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="flex flex-col items-center justify-center gap-2 px-16">
      <h1 className="inline-flex flex-row items-center justify-center text-4xl">
        AniList Tools
      </h1>
      <p>This site is currently a work-in-progress.</p>
    </main>
  );
}
