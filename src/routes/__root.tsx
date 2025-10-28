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
import { useDarkMode, useMediaQuery } from "usehooks-ts";
import {
  PiArrowRightBold,
  PiGithubLogo,
  PiListBold,
  PiMoonFill,
  PiSunFill,
} from "react-icons/pi";
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

  const { isDarkMode } = useDarkMode();

  return (
    <div
      className="bg-base-100 flex h-dvh w-dvw flex-col items-center justify-center lg:flex-row"
      data-theme={isDarkMode ? "dracula" : "fantasy"}
    >
      {lg ? (
        <nav className="bg-base-200 flex h-full max-w-40 min-w-40 flex-col items-center justify-between pb-4 shadow">
          <ul className="menu w-full flex-1 px-4">
            <MenuItems
              login={login}
              logout={logout}
              Item={({ children }) => (
                <li className="inline-flex flex-row items-center justify-center">
                  {children}
                </li>
              )}
              Divider={() => <li></li>}
              Space={() => <div className="my-1 h-0 w-full"></div>}
              Filler={() => <div className="grow"></div>}
            />
          </ul>
        </nav>
      ) : (
        <nav className="bg-base-200 flex w-full flex-row items-center justify-between px-4 py-2 shadow">
          <Popover className="relative">
            <PopoverButton className="btn btn-sm btn-ghost btn-square">
              <PiListBold className="size-6" />
            </PopoverButton>
            <PopoverBackdrop className="fixed inset-0 z-10 bg-black/30 backdrop-blur-xs" />
            <PopoverPanel className="bg-base-200 fixed top-0 left-0 z-20 flex h-dvh max-w-40 min-w-40 flex-col items-center justify-between pb-4">
              <ul className="menu h-full w-full px-4">
                <MenuItems
                  login={login}
                  logout={logout}
                  Item={({ children }) => (
                    <li className="inline-flex flex-row items-center justify-center">
                      {children}
                    </li>
                  )}
                  CloseButton={CloseButton}
                  Space={() => <div className="my-1 h-0 w-full"></div>}
                  Divider={() => <li></li>}
                  Filler={() => <div className="grow"></div>}
                />
              </ul>
            </PopoverPanel>
          </Popover>
          {viewer.data ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <a
                className="link link-hover link-primary"
                href={viewer.data.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="rounded-lg"
                  src={viewer.data.avatar.medium}
                  width={32}
                  height={32}
                />
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
      <div className="flex h-full w-full flex-col items-center justify-start">
        <div className="my-4 w-full grow lg:w-[54rem] xl:w-[70rem] 2xl:w-[86rem]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function MenuItems({
  Item,
  CloseButton,
  Divider,
  Filler,
  Space,
  logout,
  login,
}: {
  Item: React.ElementType;
  CloseButton?: React.ElementType;
  Divider: React.ElementType;
  Filler: React.ElementType;
  Space: React.ElementType;
  logout: () => void;
  login: () => void;
}) {
  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
  });
  const { isDarkMode, toggle } = useDarkMode();

  const Link_ = CloseButton ?? Link;

  return (
    <>
      <Item>
        <Link_ as={Link} to="/" className="text-lg">
          Home
        </Link_>
      </Item>
      <Divider />
      <Item>
        <Link_ as={Link} to="/scorer">
          Scorer
        </Link_>
      </Item>
      <Filler />
      <Item>
        <a
          className="link link-hover link-primary"
          href="https://github.com/1Computer1/anilist-tools"
          target="_blank"
          rel="noopener noreferrer"
        >
          <PiGithubLogo /> Source
        </a>
      </Item>
      {viewer.data ? (
        <>
          <Divider />
          <Space />
          <a
            className="link link-hover link-primary self-center"
            href={viewer.data.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="rounded-lg"
              src={viewer.data.avatar.medium}
              width={64}
              height={64}
            />
          </a>
          <Space />
          <Item>
            <a
              className="link link-hover link-primary"
              href={viewer.data.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {viewer.data.name}
            </a>
          </Item>
          <Space />
          <Button
            className="btn btn-neutral btn-outline btn-sm flex flex-row items-center justify-center"
            onClick={() => toggle()}
          >
            {!isDarkMode ? <PiSunFill /> : <PiMoonFill />}
            <PiArrowRightBold />
            {isDarkMode ? <PiSunFill /> : <PiMoonFill />}
          </Button>
          <Space />
          <Button
            className="btn btn-sm btn-primary btn-outline"
            onClick={logout}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Space />
          <Button
            className="btn btn-neutral btn-outline btn-sm flex flex-row items-center justify-center"
            onClick={() => toggle()}
          >
            {!isDarkMode ? <PiSunFill /> : <PiMoonFill />}
            <PiArrowRightBold />
            {isDarkMode ? <PiSunFill /> : <PiMoonFill />}
          </Button>
          <Space />
          <Button
            className="btn btn-sm btn-primary btn-outline"
            onClick={login}
          >
            Login with Anilist
          </Button>
        </>
      )}
    </>
  );
}

export const Route = createRootRoute({ component: Root });
