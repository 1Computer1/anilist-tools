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

  return (
    <>
      <HeadContent />
      <div
        className="bg-base-100 flex h-dvh w-dvw flex-col items-stretch justify-center lg:flex-row"
        data-theme={isDarkMode ? "dracula" : "fantasy"}
      >
        {lg ? (
          <nav className="bg-base-200 flex h-full max-w-40 min-w-40 flex-col items-center justify-between pb-4 shadow">
            <ul className="menu w-full flex-1 px-4">
              <MenuItems
                login={login}
                logout={logout}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                Item={({ children }) => (
                  <li className="has-data-[status=active]:bg-base-content/10 rounded-field inline-flex flex-row items-center justify-center">
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
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    Item={({ children }) => (
                      <li className="has-data-[status=active]:bg-base-content/10 rounded-field inline-flex flex-row items-center justify-center">
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
                Login with Anilist
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
    </>
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
  isDarkMode,
  toggleDarkMode,
}: {
  Item: React.ElementType;
  CloseButton?: React.ElementType;
  Divider: React.ElementType;
  Filler: React.ElementType;
  Space: React.ElementType;
  logout: () => void;
  login: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const viewer = useAnilistQuery(["viewer"], getViewer, {
    staleTime: Infinity,
  });

  const Link_ = CloseButton
    ? ({ ...props }) => <CloseButton as={Link} {...props} />
    : Link;

  const linkClassName = clsx(
    "flex-center w-full data-[status=active]:hover:bg-transparent",
  );

  return (
    <>
      <Item>
        <Link_ to="/" className={clsx(linkClassName, "text-lg")}>
          Home
        </Link_>
      </Item>
      <Divider />
      <Item>
        <Link_ to="/scorer" className={linkClassName}>
          Scorer
        </Link_>
      </Item>
      <Filler />
      <Item>
        <a
          className="link link-hover link-primary inline-flex-center w-full"
          href="https://github.com/1Computer1/anilist-tools"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
          <PiGithubLogo />
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
              className="rounded-field"
              src={viewer.data.avatar.medium}
              width={64}
              height={64}
            />
          </a>
          <Space />
          <Item>
            <a
              className="link link-hover link-primary inline-flex-center w-full text-center wrap-anywhere"
              href={viewer.data.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {viewer.data.name}
            </a>
          </Item>
          <Space />
          <Button
            className="btn btn-outline light:btn-neutral btn-sm flex w-full flex-row items-center justify-center"
            onClick={() => toggleDarkMode()}
          >
            {!isDarkMode ? <PiSunFill /> : <PiMoonFill />}
            <PiArrowRightBold />
            {isDarkMode ? <PiSunFill /> : <PiMoonFill />}
          </Button>
          <Space />
          <Button
            className="btn btn-sm btn-primary btn-outline w-full"
            onClick={logout}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Space />
          <Button
            className="btn btn-outline light:btn-neutral btn-sm flex w-full flex-row items-center justify-center"
            onClick={() => toggleDarkMode()}
          >
            {!isDarkMode ? <PiSunFill /> : <PiMoonFill />}
            <PiArrowRightBold />
            {isDarkMode ? <PiSunFill /> : <PiMoonFill />}
          </Button>
          <Space />
          <Button
            className="btn btn-sm btn-primary btn-outline w-full"
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
