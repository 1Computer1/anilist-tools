import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

export const Route = createFileRoute("/redirect")({
  component: Redirect,
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

function Redirect() {
  const [_, setAccessToken] = useLocalStorage("access_token", "");
  useEffect(() => {
    const t = new URLSearchParams(window.location.hash.slice(1));
    if (t.has("access_token")) {
      setAccessToken(t.get("access_token")!);
      window.close();
    }
  });
  return <div></div>;
}
