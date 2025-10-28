import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import useAccessToken from "../hooks/useAccessToken";
import { useAnilistQuery } from "../hooks/anilist";
import {
  Button,
  CloseButton,
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { getViewer } from "../api/queries/viewer";
import { useMediaQuery } from "usehooks-ts";
import { PiGithubLogo, PiListBold } from "react-icons/pi";
import { useQueryClient } from "@tanstack/react-query";

const ANILIST_OAUTH_URL = `https://anilist.co/api/v2/oauth/authorize?client_id=${import.meta.env.VITE_ANILIST_APPID}&response_type=token`;

function Root() {
  const { removeToken } = useAccessToken();
  const queryClient = useQueryClient();

  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
  });

  const login = () => {
    window.open(
      ANILIST_OAUTH_URL,
      "anilist_oauth",
      "popup,height=480,width=640",
    );
  };

  const logout = () => {
    removeToken();
    queryClient.cancelQueries();
    queryClient.removeQueries();
  };

  const lg = useMediaQuery("(width >= 64rem)");

  const menuItems: (
    | ((Outer?: React.ElementType) => React.JSX.Element)
    | { divider: true }
    | { fill: true }
  )[] = [
    (Outer = Link) => (
      <Outer as={Link} to="/" className="text-lg">
        Home
      </Outer>
    ),
    { divider: true },
    (Outer = Link) => (
      <Outer as={Link} to="/scorer">
        Scorer
      </Outer>
    ),
    { fill: true },
    { divider: true },
    (Outer = "a") => (
      <Outer
        as="a"
        className="link link-hover link-primary"
        href="https://github.com/1Computer1/anilist-tools"
        target="_blank"
        rel="noopener noreferrer"
      >
        <PiGithubLogo /> Source
      </Outer>
    ),
    { divider: true },
  ];

  return (
    <div className="bg-base-100 flex h-screen w-screen flex-col items-center justify-center lg:flex-row">
      {lg ? (
        <nav className="bg-base-200 flex h-full max-w-36 min-w-36 flex-col items-center justify-between pb-4 shadow">
          <ul className="menu flex-1 px-2">
            {menuItems.map((x) =>
              "fill" in x ? (
                <div className="grow"></div>
              ) : "divider" in x ? (
                <li></li>
              ) : (
                <li className="inline-flex flex-row items-center justify-center">
                  {x()}
                </li>
              ),
            )}
          </ul>
          <div className="flex flex-col items-center justify-center gap-2">
            {viewer.data ? (
              <>
                <a
                  href={viewer.data.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-xl btn-square btn-ghost"
                >
                  <img
                    className="rounded-lg"
                    src={viewer.data.avatar.medium}
                    width={64}
                    height={64}
                  ></img>
                </a>
                <span className="inline-flex flex-row items-center justify-center whitespace-pre">
                  <a
                    className="link link-hover link-primary"
                    href={viewer.data.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {viewer.data.name}
                  </a>
                </span>
                <Button
                  className="btn btn-sm btn-primary btn-outline"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="btn btn-sm btn-primary btn-outline"
                onClick={login}
              >
                Login with Anilist
              </Button>
            )}
          </div>
        </nav>
      ) : (
        <nav className="bg-base-200 flex w-full flex-row items-center justify-between px-4 py-2 shadow">
          <Popover className="relative">
            <PopoverButton className="btn btn-sm btn-ghost btn-square">
              <PiListBold className="size-6" />
            </PopoverButton>
            <PopoverBackdrop className="fixed inset-0 z-10 bg-black/30 backdrop-blur-xs" />
            <PopoverPanel className="bg-base-200 fixed top-0 left-0 z-20 flex h-dvh flex-col items-center justify-between pb-4">
              <ul className="menu h-full">
                {menuItems.map((x) =>
                  "fill" in x ? (
                    <div className="grow"></div>
                  ) : "divider" in x ? (
                    <li></li>
                  ) : (
                    <li className="inline-flex flex-row items-center justify-center">
                      {x(CloseButton)}
                    </li>
                  ),
                )}
              </ul>
              {viewer.data && (
                <Button
                  className="btn btn-sm btn-primary btn-outline"
                  onClick={logout}
                >
                  Logout
                </Button>
              )}
            </PopoverPanel>
          </Popover>
          {viewer.data ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <span className="inline-flex flex-row items-center justify-center whitespace-pre">
                <a
                  className="link link-hover link-primary"
                  href={viewer.data.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {viewer.data.name}
                </a>
              </span>
              <a
                href={viewer.data.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-square btn-ghost btn-sm"
              >
                <img
                  className="rounded-lg"
                  src={viewer.data.avatar.medium}
                  width={32}
                  height={32}
                ></img>
              </a>
            </div>
          ) : (
            <Button
              className="btn btn-sm btn-primary btn-outline"
              onClick={login}
            >
              Login with Anilist
            </Button>
          )}
        </nav>
      )}
      <div className="flex h-full grow flex-col items-center justify-start">
        <div className="my-4 grow lg:w-[54rem] xl:w-[70rem] 2xl:w-[86rem]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({ component: Root });
