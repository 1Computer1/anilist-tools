import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
} from "@tanstack/react-router";
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
import clsx from "clsx";
import { useEffect } from "react";
import { IsDarkModeContext } from "../hooks/useIsDarkMode";
import logoImg from "../images/logo2.webp";

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

  const { isDarkMode, toggle: toggleDarkMode } = useDarkMode();
  useEffect(() => {
    document.body.setAttribute(
      "data-theme",
      isDarkMode ? "dracula" : "fantasy",
    );
  }, [isDarkMode]);

  return (
    <>
      <HeadContent />
      <IsDarkModeContext value={isDarkMode}>
        <div className="bg-base-100 flex h-dvh w-dvw flex-col items-stretch justify-center lg:flex-row">
          {lg ? (
            <nav className="bg-base-200 flex h-full max-w-40 min-w-40 flex-col items-center justify-between pb-4 shadow">
              <ul className="menu w-full flex-1 gap-y-1 px-4">
                <MenuItems
                  login={login}
                  logout={logout}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  divider={<li></li>}
                  space={<div className="h-0 w-full"></div>}
                  filler={<div className="grow"></div>}
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
                <PopoverPanel
                  transition
                  className={clsx(
                    "bg-base-200 fixed top-0 left-0 z-20 flex h-dvh max-w-40 min-w-40 flex-col items-center justify-between pb-4",
                    "origin-left transition duration-150 ease-out data-closed:-translate-x-90 data-closed:scale-x-90 data-closed:opacity-0 motion-reduce:transition-none",
                  )}
                >
                  <ul className="menu h-full w-full gap-y-1 px-4">
                    <MenuItems
                      login={login}
                      logout={logout}
                      isDarkMode={isDarkMode}
                      toggleDarkMode={toggleDarkMode}
                      wrapCloseButton
                      space={<div className="h-0 w-full"></div>}
                      divider={<li></li>}
                      filler={<div className="grow"></div>}
                    />
                  </ul>
                </PopoverPanel>
              </Popover>
              {viewer.data ? (
                <div className="flex flex-row items-center justify-center gap-2">
                  <a
                    className="link link-hover link-primary btn btn-ghost btn-square h-8 w-8"
                    href={viewer.data.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className="rounded-field"
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
                  Login with AniList
                </Button>
              )}
            </nav>
          )}
          <div className="flex grow flex-col items-center justify-start">
            <div className="my-2 h-full w-full lg:my-4">
              <Outlet />
            </div>
          </div>
        </div>
      </IsDarkModeContext>
    </>
  );
}

function MenuItems({
  wrapCloseButton = false,
  divider,
  filler,
  space,
  logout,
  login,
  isDarkMode,
  toggleDarkMode,
}: {
  wrapCloseButton?: boolean;
  divider: React.ReactNode;
  filler: React.ReactNode;
  space: React.ReactNode;
  logout: () => void;
  login: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
  });

  const Link_ = wrapCloseButton
    ? ({ ...props }) => <CloseButton as={Link} {...props} />
    : Link;

  const linkClassName = clsx("flex-center w-full");

  return (
    <>
      <Link_ to="/" className={linkClassName}>
        <div className="light:bg-neutral flex-center rounded-field light:shadow-md h-12 w-full">
          <img
            src={logoImg}
            alt="ALter"
            className="pointer-events-none h-8 drop-shadow-xs select-none"
            draggable={false}
          />
        </div>
      </Link_>
      {divider}
      <MenuItem>
        <Link_ to="/scorer" className={linkClassName}>
          Scorer
        </Link_>
      </MenuItem>
      <MenuItem>
        <Link_ to="/dropper" className={linkClassName}>
          Dropper
        </Link_>
      </MenuItem>
      <MenuItem>
        <Link_ to="/fixer" className={linkClassName}>
          Fixer
        </Link_>
      </MenuItem>
      {filler}
      <MenuItem>
        <a
          className="link link-hover link-primary inline-flex-center w-full"
          href="https://github.com/1Computer1/anilist-tools"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
          <PiGithubLogo />
        </a>
      </MenuItem>
      {viewer.data ? (
        <>
          {divider}
          {space}
          <a
            className="link link-hover link-primary btn btn-ghost btn-square h-16 w-16 self-center"
            href={viewer.data.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="rounded-field"
              src={viewer.data.avatar.medium}
              width={64}
              height={64}
            />
          </a>
          {space}
          <MenuItem>
            <a
              className="link link-hover link-primary inline-flex-center w-full text-center wrap-anywhere"
              href={viewer.data.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {viewer.data.name}
            </a>
          </MenuItem>
          {space}
          <ToggleDarkModeButton
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          {space}
          <Button
            className="btn btn-sm btn-primary btn-outline w-full"
            onClick={logout}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          {space}
          <ToggleDarkModeButton
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          {space}
          <Button
            className="btn btn-sm btn-primary btn-outline w-full"
            onClick={login}
          >
            Login with AniList
          </Button>
        </>
      )}
    </>
  );
}

function MenuItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-field inline-flex flex-row items-center justify-center has-data-[status=active]:bg-(--menu-active-bg) has-data-[status=active]:text-(--menu-active-fg)">
      {children}
    </li>
  );
}

function ToggleDarkModeButton({
  isDarkMode,
  toggleDarkMode,
}: {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  return (
    <Button
      className={clsx(
        "btn btn-outline light:btn-neutral btn-sm flex w-full flex-row items-center justify-center",
        "dark:hover:[--btn-bg:var(--color-base-content)] dark:hover:[--btn-fg:var(--color-base-200)]",
        "dark:focus-visible::[--btn-border:var(--color-base-content)] dark:focus-visible:[--btn-bg:var(--color-base-content)] dark:focus-visible:[--btn-fg:var(--color-base-200)]",
      )}
      onClick={() => toggleDarkMode()}
    >
      {!isDarkMode ? <PiSunFill /> : <PiMoonFill />}
      <PiArrowRightBold />
      {isDarkMode ? <PiSunFill /> : <PiMoonFill />}
    </Button>
  );
}

export const Route = createRootRoute({ component: Root });
