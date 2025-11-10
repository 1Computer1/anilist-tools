import { createFileRoute, Link } from "@tanstack/react-router";
import clsx from "clsx";
import {
  PiFileDashedFill,
  PiLineSegmentsFill,
  PiNavigationArrowFill,
  PiNotePencilFill,
  PiScrewdriverFill,
  PiStarFill,
  PiTrashFill,
} from "react-icons/pi";
import logoImg from "../images/logo2.webp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ALter" },
      {
        name: "description",
        content: "Enhance your AniList experience with powerful tools!",
      },
    ],
  }),
});

function Index() {
  const linkClassName = clsx(
    "btn btn-primary btn-sm md:btn-md lg:btn-lg btn-outline",
  );
  const plannedClassName = clsx(
    "btn btn-primary btn-dash btn-sm md:btn-md lg:btn-lg pointer-events-none select-none",
  );

  return (
    <main className="flex h-full w-full flex-col items-center justify-start gap-4 overflow-y-auto px-8 lg:gap-8 lg:px-16">
      <div className="flex-center gap-2">
        <h1 className="light:bg-neutral flex-center rounded-box h-24 w-64">
          <img
            src={logoImg}
            alt="ALter"
            className="pointer-events-none h-16 w-auto select-none"
            draggable={false}
          />
        </h1>
        <p className="text-center text-base lg:text-lg dark:opacity-75">
          Enhance your AniList experience with powerful tools!
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
              <p>Drop entries that you have not updated in a long time.</p>
              <p>
                Filter by currently watching/reading and paused entries in your
                lists.
              </p>
            </>
          }
          link={
            <Link to="/dropper" className={linkClassName}>
              <PiNavigationArrowFill /> Go
            </Link>
          }
        />
        <Card
          title={
            <>
              <PiScrewdriverFill /> Fixer
            </>
          }
          desc={
            <>
              <p>Fix inconsistent data such as:</p>
              <ul className="list-inside list-disc">
                <li>Invalid entry status.</li>
                <li>Completed entries with missing progress.</li>
                <li>Missing or invalid start and finish dates.</li>
              </ul>
            </>
          }
          link={
            <Link to="/fixer" className={linkClassName}>
              <PiNavigationArrowFill /> Go
            </Link>
          }
        />
        <Card
          title={
            <>
              <PiNotePencilFill /> Noter
            </>
          }
          desc={
            <>
              <p>Search your notes and edit them all at once.</p>
              <p>
                Supports find & replace with regular expressions and text
                manipulation.
              </p>
            </>
          }
          link={
            <div className={plannedClassName}>
              <PiFileDashedFill /> Planned
            </div>
          }
        />
        <Card
          title={
            <>
              <PiLineSegmentsFill /> Relater
            </>
          }
          desc={
            <>
              <p>
                Find new media related to what you have in your list and add
                them as planning.
              </p>
              <p>Filter by relation type and media type.</p>
            </>
          }
          link={
            <div className={plannedClassName}>
              <PiFileDashedFill /> Planned
            </div>
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
}: {
  title: React.ReactNode;
  desc: React.ReactNode;
  link: React.ReactNode;
}) {
  return (
    <div className="flex flex-row flex-wrap items-center justify-start">
      <div className="card card-side card-sm md:card-md lg:card-lg card-border dark:bg-base-200 h-42 w-80 shadow-md md:h-50 md:w-100 lg:h-56 lg:w-120 dark:shadow">
        <div className="to-base-100 dark:to-base-200 from-base-200 dark:from-base-300 rounded-l-box h-full w-8 min-w-8 bg-linear-to-r md:w-10 md:min-w-10 lg:w-12 lg:min-w-12"></div>
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
