import { createFileRoute, Link } from "@tanstack/react-router";
import clsx from "clsx";
import { PiNavigationArrowFill, PiStarFill, PiTrashFill } from "react-icons/pi";
import scorerLightImg from "../images/scorer-light.avif";
import scorerDarkImg from "../images/scorer-dark.avif";
import dropperLightImg from "../images/dropper-light.avif";
import dropperDarkImg from "../images/dropper-dark.avif";
import useIsDarkMode from "../hooks/useIsDarkMode";

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
  const linkClassName = clsx("btn btn-primary btn-outline");
  const isDarkMode = useIsDarkMode();

  return (
    <main className="flex h-full w-full flex-col items-center justify-start gap-6 overflow-y-auto px-16 lg:gap-8">
      <div className="flex-center gap-1">
        <h1 className="text-center text-4xl">AniList Tools</h1>
        <p className="text-center text-sm opacity-50 lg:text-base">
          Enhance your AniList experience with various tools!
        </p>
      </div>
      <div className="flex min-h-0 w-full basis-0 flex-row flex-wrap items-center justify-center gap-6 lg:gap-8">
        <Card
          title={
            <>
              <PiStarFill /> Scorer
            </>
          }
          desc={
            <>
              <p>Quickly apply new scores to your anime and manga list.</p>
              <p>
                Powered with keyboard shortcuts to rate using your scoring
                format.
              </p>
            </>
          }
          img={isDarkMode ? scorerDarkImg : scorerLightImg}
          link={
            <Link to="/scorer" className={linkClassName}>
              <PiNavigationArrowFill /> Go
            </Link>
          }
        />
        <Card
          title={
            <>
              <PiTrashFill /> Dropper
            </>
          }
          desc={
            <>
              <p>
                Drop shows and manga that you have not updated in a long time.
              </p>
              <p>
                Filter by currently watching/reading and paused entries in your
                lists.
              </p>
            </>
          }
          img={isDarkMode ? dropperDarkImg : dropperLightImg}
          link={
            <Link to="/dropper" className={linkClassName}>
              <PiNavigationArrowFill /> Go
            </Link>
          }
        />
      </div>
    </main>
  );
}

function Card({
  title,
  desc,
  link,
  img,
}: {
  title: React.ReactNode;
  desc: React.ReactNode;
  img: string;
  link: React.ReactNode;
}) {
  return (
    <div className="flex flex-row flex-wrap items-center justify-start">
      <div className="card card-side lg:card-lg card-border dark:bg-base-200 h-50 w-80 shadow-md lg:w-120 dark:shadow">
        <figure className="h-50 w-25 lg:w-50">
          <img
            className="pointer-events-none mask-t-from-95% mask-r-from-0% mask-b-from-95% mask-l-from-95% object-cover object-[left_center] blur-[0.5px]"
            src={img}
            draggable={false}
          />
        </figure>
        <div className="card-body justify-between py-2 pr-4 pl-4">
          <div className="flex flex-col gap-y-1">
            <h2 className="card-title">{title}</h2>
            <div className="flex flex-col gap-y-1">{desc}</div>
          </div>
          <div className="card-actions justify-end">{link}</div>
        </div>
      </div>
    </div>
  );
}
