import { createFileRoute, Link } from "@tanstack/react-router";
import clsx from "clsx";
import {
  PiFileDashedFill,
  PiNavigationArrowFill,
  PiNotePencilFill,
  PiRocketLaunchFill,
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
  const linkClassName = clsx("btn btn-primary btn-sm md:btn-md btn-outline");
  const plannedClassName = clsx(
    "btn btn-primary btn-dash btn-sm md:btn-md pointer-events-none select-none",
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
      <div className="flex min-h-0 w-full basis-0 flex-row flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8">
        <Card
          title={
            <>
              <PiStarFill className="text-yellow-600" /> Scorer
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
              <PiTrashFill className="text-error" /> Dropper
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
              <PiScrewdriverFill className="text-info" /> Fixer
            </>
          }
          desc={
            <>
              <p>Fix inconsistent data such as:</p>
              <ul className="list-inside list-disc">
                <li>Invalid entry status.</li>
                <li>Missing completion progress.</li>
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
              <PiNotePencilFill className="text-accent" /> Noter
            </>
          }
          desc={
            <>
              <p>Search your notes and edit them all at once.</p>
              <p>
                Find and replace with regular expressions, and further process
                your notes with custom scripts.
              </p>
            </>
          }
          link={
            <Link to="/noter" className={linkClassName}>
              <PiNavigationArrowFill /> Go
            </Link>
          }
        />
        <Card
          title={
            <>
              <PiRocketLaunchFill className="text-neutral" /> New Tools?
            </>
          }
          desc={
            <>
              <p>More coming in the future!</p>
              <p>Send some suggestions if you have any!</p>
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
      <div className="card card-side card-sm md:card-md lg:card-lg card-border dark:bg-base-200 shadow-md48 h-48 w-70 md:w-90 lg:w-100 dark:shadow">
        <div className="to-base-100 dark:to-base-200 from-base-200 dark:from-base-300 rounded-l-box h-full w-6 min-w-6 bg-linear-to-r md:w-8 md:min-w-8 lg:w-10 lg:min-w-10"></div>
        <div className="card-body justify-between gap-1 px-3 pt-2 pb-3 md:gap-2 md:px-4 md:pb-4">
          <div className="flex flex-col gap-y-1">
            <h2 className="card-title">{title}</h2>
            <div className="flex flex-col gap-y-1 text-sm supports-[text-wrap:pretty]:text-pretty lg:pr-8">
              {desc}
            </div>
          </div>
          <div className="card-actions justify-end">{link}</div>
        </div>
      </div>
    </div>
  );
}
