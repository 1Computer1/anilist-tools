import { type Viewer } from "../../api/queries/viewer";
import { useDialog, type DialogState } from "../../hooks/useDialog";
import type { ConfirmDialogContext } from "../../components/dialogs/ConfirmDialog";
import SettingsItemTitleLanguage from "../../components/list/settings/SettingsItemTitleLanguage";
import SettingsItemFilter from "../../components/list/settings/SettingsItemFilter";
import SettingsItemList from "../../components/list/settings/SettingsItemList";
import SettingsItemSortBy from "../../components/list/settings/SettingsItemsSortBy";
import SettingsItemSortDir from "../../components/list/settings/SettingsItemsSortDir";
import { nameOfListType, nameOfStatus, SORT_BYS } from "../../util/settings";
import type { FixerSettings } from "./fixerSettings";
import type { UseAnilistQueryResult } from "../../hooks/anilist";
import type { FixerListDraftAction } from "../fixer";
import { Field, Switch, Label, Button } from "@headlessui/react";
import {
  PiArrowFatRightFill,
  PiQuestionFill,
  PiScrewdriverFill,
} from "react-icons/pi";
import { type Cell } from "../../hooks/useCell";
import * as _ from "lodash-es";
import CustomDialog from "../../components/dialogs/CustomDialog";
import {
  MEDIA_LIST_STATUSES,
  type MediaListStatus,
  type MediaType,
} from "../../api/queries/list";
import SettingsItemStatuses from "../../components/list/settings/SettingsItemStatuses";
import SettingsDivider from "../../components/list/settings/SettingsDivider";

export default function FixerSettingsItems({
  dispatch,
  settings,
  viewer,
  hasUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<FixerListDraftAction>;
  settings: FixerSettings;
  viewer: UseAnilistQueryResult<Viewer>;
  hasUnsavedChanges: boolean;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  const isAnime = settings.listType.value === "ANIME";
  const episodes = isAnime ? "Episodes" : "Chapters";
  const airing = isAnime ? "Airing" : "Releasing";
  const helpDialog = useDialog();

  return (
    <>
      <CustomDialog title="Fixes" state={helpDialog}>
        <ul className="mb-2 flex w-full flex-col gap-2">
          <HelpExample
            label="Invalid Status"
            listType={settings.listType.value}
            statuses={_.without(MEDIA_LIST_STATUSES, "PLANNING")}
            fixes={[
              {
                criteria: `${nameOfListType(settings.listType.value)} Not Started ${airing}`,
                before: "Status",
                after: nameOfStatus(settings.listType.value, "PLANNING"),
              },
              {
                criteria: `${nameOfListType(settings.listType.value)} Not Ended ${airing}`,
                before: "Status",
                after: `${nameOfStatus(settings.listType.value, "CURRENT")}, ${nameOfStatus(settings.listType.value, "PAUSED")}, or ${nameOfStatus(settings.listType.value, "PLANNING")}`,
              },
            ]}
            viewer={viewer}
            setting={settings.fixes.invalidStatus}
          />
          <HelpExample
            label="Invalid Progress"
            listType={settings.listType.value}
            statuses={["COMPLETED", "PLANNING"]}
            fixes={[
              {
                criteria: `${episodes} ≠ Total`,
                before: episodes,
                after: "Total",
              },
              {
                criteria: `Planning But ${episodes} > 0`,
                before: episodes,
                after: "0",
              },
              ...(!isAnime
                ? [
                    {
                      criteria: `Volumes ≠ Total`,
                      before: "Volumes",
                      after: "Total",
                    },
                    {
                      criteria: `Planning But Volumes > 0`,
                      before: "Volumes",
                      after: "0",
                    },
                  ]
                : []),
            ]}
            viewer={viewer}
            setting={settings.fixes.invalidProgress}
          />
          <HelpExample
            label="Invalid Start Date"
            listType={settings.listType.value}
            statuses={MEDIA_LIST_STATUSES}
            fixes={[
              {
                criteria: `Date < ${airing} Date`,
                before: "Date",
                after: `Start ${airing} Date`,
              },
              {
                criteria: `Planning But Has Date`,
                before: "Date",
                after: `∅`,
              },
            ]}
            viewer={viewer}
            setting={settings.fixes.invalidStartDate}
          />
          <HelpExample
            label="Invalid Finish Date"
            listType={settings.listType.value}
            statuses={["COMPLETED", "REPEATING", "PLANNING"]}
            fixes={[
              {
                criteria: `Date < End ${airing} Date`,
                before: "Date",
                after: `End ${airing} Date`,
              },
              {
                criteria: `Date < Start Date`,
                before: "Date",
                after: `Start Date`,
              },
              {
                criteria: `Not Finished But Has Date`,
                before: "Date",
                after: `∅`,
              },
            ]}
            viewer={viewer}
            setting={settings.fixes.invalidEndDate}
          />
          <HelpExample
            label="Missing Start Date"
            listType={settings.listType.value}
            statuses={_.without(MEDIA_LIST_STATUSES, "PLANNING")}
            fixes={[
              {
                criteria: "Missing Date",
                before: "∅",
                after: `Earlier of Finish Date & Start ${airing} Date`,
              },
              {
                criteria: "Missing Both Dates",
                before: "∅",
                after: `Start ${airing} Date`,
              },
            ]}
            viewer={viewer}
            setting={settings.fixes.missingStartDate}
          />
          <HelpExample
            label="Missing Finish Date"
            listType={settings.listType.value}
            statuses={["COMPLETED", "REPEATING"]}
            fixes={[
              {
                criteria: "Missing Date",
                before: "∅",
                after: `Later of Start Date & End ${airing} Date`,
              },
              {
                criteria: "Missing Both Dates",
                before: "∅",
                after: `End ${airing} Date`,
              },
            ]}
            viewer={viewer}
            setting={settings.fixes.missingEndDate}
          />
          <HelpExample
            label="Edit All Dates"
            listType={settings.listType.value}
            statuses={MEDIA_LIST_STATUSES}
            fixes={[
              {
                criteria: `Any Date`,
                before: "Date",
                after: `Custom Date`,
              },
            ]}
            viewer={viewer}
            setting={settings.fixes.allDates}
          />
        </ul>
      </CustomDialog>
      <SettingsItemList
        viewer={viewer}
        listType={settings.listType}
        hasUnsavedChanges={hasUnsavedChanges}
        confirmDialog={confirmDialog}
        onChange={() => dispatch({ t: "reset" })}
      />
      <SettingsDivider />
      <div className="flex flex-row items-center gap-1">
        <div>Fixes to Apply</div>
        <Button
          className="btn btn-ghost btn-square btn-xs"
          onClick={() => helpDialog.open()}
        >
          <PiQuestionFill className="size-4" />
        </Button>
      </div>
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-center md:gap-0.5">
        <Button
          className="btn btn-xs btn-primary btn-outline grow basis-0 px-0 py-1"
          onClick={() => _.forEach(settings.fixes, (c) => c.set(true))}
        >
          Select All
        </Button>
        <Button
          className="btn btn-xs btn-primary btn-outline grow basis-0 px-0 py-1"
          onClick={() => _.forEach(settings.fixes, (c) => c.set(false))}
        >
          Select None
        </Button>
      </div>
      <FixCheckbox
        viewer={viewer}
        label="Invalid Status"
        setting={settings.fixes.invalidStatus}
      />
      <FixCheckbox
        viewer={viewer}
        label="Invalid Progress"
        setting={settings.fixes.invalidProgress}
      />
      <FixCheckbox
        viewer={viewer}
        label="Invalid Start Date"
        setting={settings.fixes.invalidStartDate}
      />
      <FixCheckbox
        viewer={viewer}
        label="Invalid Finish Date"
        setting={settings.fixes.invalidEndDate}
      />
      <FixCheckbox
        viewer={viewer}
        label="Missing Start Date"
        setting={settings.fixes.missingStartDate}
      />
      <FixCheckbox
        viewer={viewer}
        label="Missing Finish Date"
        setting={settings.fixes.missingEndDate}
      />
      <FixCheckbox
        viewer={viewer}
        label="Edit All Dates"
        setting={settings.fixes.allDates}
      />
      <Button
        className="btn btn-outline btn-sm btn-secondary text-sm"
        disabled={viewer.data == null}
        onClick={() => {
          dispatch({
            t: "updateRecommendedAll",
            show: {
              status: settings.fixes.invalidStatus.value,
              progress: settings.fixes.invalidProgress.value,
              dates:
                settings.fixes.invalidStartDate.value ||
                settings.fixes.invalidEndDate.value ||
                settings.fixes.missingStartDate.value ||
                settings.fixes.missingEndDate.value ||
                settings.fixes.allDates.value,
            },
          });
        }}
      >
        <PiScrewdriverFill /> Fix
      </Button>
      <SettingsDivider />
      <SettingsItemFilter viewer={viewer} filter={settings.filter} />
      <SettingsItemTitleLanguage
        viewer={viewer}
        titleLanguage={settings.titleLanguage}
      />
      <SettingsItemStatuses
        viewer={viewer}
        listType={settings.listType.value}
        options={MEDIA_LIST_STATUSES}
        statuses={settings.allowedStatuses}
      />
      <SettingsItemSortBy
        viewer={viewer}
        sortBy={settings.sortBy}
        options={SORT_BYS}
      />
      <SettingsItemSortDir
        viewer={viewer}
        sortBy={settings.sortBy.value}
        sortDir={settings.sortDir}
        randomSeed={settings.randomSeed}
      />
    </>
  );
}

function FixCheckbox({
  viewer,
  label,
  setting,
}: {
  viewer: UseAnilistQueryResult<Viewer>;
  label: string;
  setting: Cell<boolean>;
}) {
  return (
    <Field className="flex w-full flex-row items-center gap-x-2 text-sm">
      <Switch
        className="checkbox checkbox-primary checkbox-sm text-base-content bg-transparent duration-150 before:scale-75 motion-reduce:transition-none"
        disabled={viewer.data == null}
        checked={setting.value}
        onChange={setting.set}
      />
      <Label>{label}</Label>
    </Field>
  );
}

function HelpExample({
  label,
  listType,
  statuses,
  fixes,
  viewer,
  setting,
}: {
  label: string;
  listType: MediaType;
  statuses: MediaListStatus[];
  fixes: { criteria: string; before: string; after: string }[];
  viewer: UseAnilistQueryResult<Viewer>;
  setting: Cell<boolean>;
}) {
  return (
    <li className="rounded-field dark:bg-base-200 bg-base-100 border-base-200 flex w-full flex-col gap-2 border p-2 shadow-md dark:shadow">
      <div className="flex flex-col gap-x-4 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <Field className="flex flex-row items-center gap-2">
          <Switch
            className="checkbox checkbox-primary checkbox-sm text-base-content bg-transparent duration-150 before:scale-75 motion-reduce:transition-none"
            disabled={viewer.data == null}
            checked={setting.value}
            onChange={setting.set}
          />
          <Label>{label}</Label>
        </Field>
        <div className="flex flex-row gap-1">
          {statuses.map((s) => (
            <div
              key={s}
              className="border-secondary rounded-field text-secondary border border-solid px-1 py-px text-[0.525rem] sm:text-xs"
            >
              {nameOfStatus(listType, s)}
            </div>
          ))}
        </div>
      </div>
      <li className="flex flex-col gap-2">
        {fixes.map(({ criteria, before, after }) => (
          <li
            key={criteria}
            className="flex w-full flex-col gap-1 text-xs sm:flex-row sm:items-center sm:gap-2 sm:text-sm"
          >
            <div className="flex grow flex-row items-center gap-2">
              <div>{criteria}</div>
              <div className="border-neutral hidden grow border-b border-dotted px-1 sm:block"></div>
            </div>
            <div className="ml-1.5 flex flex-row items-center gap-1 sm:ml-0 sm:gap-2">
              <div className="text-error">{before}</div>
              <PiArrowFatRightFill className="text-info size-4" />
              <div className="text-info">{after}</div>
            </div>
          </li>
        ))}
      </li>
    </li>
  );
}
