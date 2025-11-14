import { type Viewer } from "../../api/queries/viewer";
import type { NoterListDraftAction } from "../noter";
import { useDialog, type DialogState } from "../../hooks/useDialog";
import type { ConfirmDialogContext } from "../../components/dialogs/ConfirmDialog";
import SettingsItemTitleLanguage from "../../components/list/settings/SettingsItemTitleLanguage";
import SettingsItemFilter from "../../components/list/settings/SettingsItemFilter";
import SettingsItemList from "../../components/list/settings/SettingsItemList";
import SettingsItemSortBy from "../../components/list/settings/SettingsItemsSortBy";
import SettingsItemSortDir from "../../components/list/settings/SettingsItemsSortDir";
import { SORT_BYS } from "../../util/settings";
import {
  nameOfRegExpFlag,
  REGEXP_FLAGS,
  type NoterSettings,
} from "./noterSettings";
import type { UseAnilistQueryResult } from "../../hooks/anilist";
import SettingsDivider from "../../components/list/settings/SettingsDivider";
import SettingsItem from "../../components/list/settings/SettingsItem";
import CodeEditor from "../../components/CodeEditor";
import SettingsItemStatuses from "../../components/list/settings/SettingsItemStatuses";
import { MEDIA_LIST_STATUSES } from "../../api/queries/list";
import {
  codeFormatter,
  escapeHtml,
  highlightToHtml,
} from "../../util/starryNight";
import { Button, Field, Label, Switch } from "@headlessui/react";
import {
  PiCheckFatFill,
  PiCodeBold,
  PiCurrencyDollarBold,
  PiFlagBannerFill,
  PiQuestionFill,
  PiSwapFill,
  PiWarningOctagonFill,
} from "react-icons/pi";
import CustomTooltip from "../../components/CustomTooltip";
import * as _ from "lodash-es";
import clsx from "clsx";
import CustomDialog from "../../components/dialogs/CustomDialog";
import type React from "react";
import CustomListbox from "../../components/CustomListbox";
import { CodeTable } from "../../components/CodeTable";
import { InlineCode } from "../../components/InlineCode";

export default function NoterSettingsItems({
  dispatch,
  settings,
  viewer,
  hasUnsavedChanges,
  confirmDialog,
}: {
  dispatch: React.Dispatch<NoterListDraftAction>;
  settings: NoterSettings;
  viewer: UseAnilistQueryResult<Viewer>;
  hasUnsavedChanges: boolean;
  confirmDialog: DialogState<ConfirmDialogContext>;
}) {
  const hasReplacement =
    settings.noteFindRegexp.value != null &&
    settings.noteFindRegexpError.value == null;

  const helpFindingDialog = useDialog();
  const helpReplacingDialog = useDialog();

  return (
    <>
      <CustomDialog title="Searching Notes" state={helpFindingDialog}>
        <div className="flex w-full flex-col justify-start gap-y-2 wrap-break-word">
          <p>
            ECMAScript-flavour regular expressions are used to search through
            notes.
            <br />
            Some useful patterns:
          </p>
          <CodeTable
            headers={["Pattern", "Usage"]}
            rows={[
              [
                "^$",
                <>
                  Selects an empty line, or with the <InlineCode>s</InlineCode>{" "}
                  flag, an empty string.
                </>,
              ],
              [
                ".+",
                <>
                  Selects a non-empty line, or with the{" "}
                  <InlineCode>s</InlineCode> flag, a non-empty string.
                </>,
              ],
            ]}
          />
          <p>
            <span className="font-bold">Useful References</span>
            <ul className="list-inside list-disc">
              <li>
                <a
                  className="link link-hover link-primary inline-flex-center wrap-anywhere"
                  href="https://regex101.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  regex101
                </a>
              </li>
              <li>
                <a
                  className="link link-hover link-primary inline-flex-center wrap-anywhere"
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MDN - Regular Expressions Cheat Sheet
                </a>
              </li>
              <li>
                <a
                  className="link link-hover link-primary inline-flex-center wrap-anywhere"
                  href="https://www.w3schools.com/js/js_regexp.asp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  W3Schools - JavaScript RegExp
                </a>
              </li>
            </ul>
          </p>
        </div>
      </CustomDialog>
      <CustomDialog
        title={
          <span>
            Replace Notes{" "}
            <span
              className={clsx(
                "btn btn-outline btn-xs pointer-events-none -mt-1 ml-1 h-6 text-sm select-none",
                settings.noteReplaceJavaScriptMode.value
                  ? "btn-accent"
                  : "btn-primary",
              )}
            >
              {settings.noteReplaceJavaScriptMode.value ? (
                <>
                  <PiCodeBold /> Script
                </>
              ) : (
                <>
                  <PiCurrencyDollarBold /> Regex
                </>
              )}{" "}
              Mode
            </span>
          </span>
        }
        state={helpReplacingDialog}
      >
        <div className="flex w-full flex-col justify-start gap-y-2 wrap-break-word">
          {settings.noteReplaceJavaScriptMode.value ? (
            <>
              <p>
                Process matched text and replace with a JavaScript value. <br />
                The following variables are available in scope:
              </p>
              <CodeTable
                headers={["Variable", "Value"]}
                rows={[
                  ["match", <>The matched text.</>],
                  [
                    "$n",
                    <>
                      String captured by the <InlineCode>n</InlineCode>th group.
                    </>,
                  ],
                  [
                    "$x",
                    <>
                      String captured by the named group named{" "}
                      <InlineCode>x</InlineCode>.
                    </>,
                  ],
                  [
                    "entry",
                    <>
                      Object containing data about the list entry.
                      <br />
                      See the{" "}
                      <a
                        className="link link-hover link-primary inline-flex-center wrap-anywhere"
                        href="https://github.com/1Computer1/anilist-tools/blob/main/src/api/queries/list.ts"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <InlineCode>Entry</InlineCode>
                      </a>{" "}
                      type definition.
                    </>,
                  ],
                  [
                    "parse",
                    <div className="flex flex-col gap-y-1">
                      Function to extract a table and separate out other text
                      from a string.
                      <CodeEditor
                        value={`parse("hello\\nkey: value\\nworld", ":")\n⇒ [{ key: "value" }, "hello\\nworld"]`}
                        uneditable={true}
                        format={codeFormatter("source.js")}
                        className="min-h-[calc(18px+20px*2)]"
                      />
                    </div>,
                  ],
                  [
                    "format",
                    <div className="flex flex-col gap-y-1">
                      Function to format a table and surrounding text.
                      <CodeEditor
                        value={`format({\n  before: "hello",\n  after: "world",\n  sep: " = ",\n  table: { key: "value" }\n})\n⇒ "hello\\nkey = value\\nworld"`}
                        uneditable={true}
                        format={codeFormatter("source.js")}
                        className="min-h-[calc(18px+20px*7)]"
                      />
                    </div>,
                  ],
                ]}
              />
              <div className="divider divider-accent h-0">
                Parse and Format Example
              </div>
              <p>Given this note:</p>
              <CodeEditor
                value={"I loved this anime!\nDoggos = 3"}
                uneditable={true}
                className="min-h-[calc(18px+20px*2)] font-sans"
              />
              <p>
                You can use match the whole note with{" "}
                <InlineCode>.+</InlineCode> and run the following script:
              </p>
              <CodeEditor
                value={`[table, after] = parse(match, "="),\ntable.Doggos = Number(table.Doggos) * 3,\nformat({ table, after, sep: ": " })`}
                uneditable={true}
                format={codeFormatter("source.js")}
                className="min-h-[calc(18px+20px*3)]"
              />
              <p>And end up with this new note:</p>
              <CodeEditor
                value={`Doggos: 9\nI loved this anime!`}
                uneditable={true}
                className="min-h-[calc(18px+20px*2)] font-sans"
              />
            </>
          ) : (
            <>
              <p>
                Replace matched text with new text. <br />
                Use the following patterns to substitute for what you matched:
              </p>
              <CodeTable
                headers={["Pattern", "Inserts"]}
                rows={[
                  ["$&", <>The matched text.</>],
                  [
                    "$n",
                    <>
                      String captured by the <InlineCode>n</InlineCode>
                      th group.
                    </>,
                  ],
                  [
                    "$<x>",
                    <>
                      String captured by the named group named{" "}
                      <InlineCode>x</InlineCode>.
                    </>,
                  ],
                  [
                    "$$",
                    <>
                      The literal string <InlineCode>$</InlineCode>.
                    </>,
                  ],
                ]}
              />
              <div className="divider divider-accent h-0">
                Regex Replace Example
              </div>
              <p>Given this note:</p>
              <CodeEditor
                value={"Fav Character: Nana, Daiba"}
                uneditable={true}
                format={{ type: "react", format: (src) => src }}
                className="font-sans"
              />
              <p>You can match the text with:</p>
              <CodeEditor
                value={`(?<=Fav Character: )(.+), (.+)`}
                uneditable={true}
                format={{
                  type: "dangerouslySetInnerHTML",
                  format: (src) =>
                    highlightToHtml(src, "source.regexp.extended"),
                }}
              />
              <p>Then use the captured parts to replace:</p>
              <CodeEditor
                value={`$2 $1`}
                uneditable={true}
                format={{
                  type: "dangerouslySetInnerHTML",
                  format: (src) => highlightReplacer(src),
                }}
              />
              <p>And end up with this new note:</p>
              <CodeEditor
                value={"Fav Character: Daiba Nana"}
                uneditable={true}
                format={{ type: "react", format: (src) => src }}
                className="font-sans"
              />
            </>
          )}
        </div>
      </CustomDialog>
      <SettingsItemList
        viewer={viewer}
        listType={settings.listType}
        hasUnsavedChanges={hasUnsavedChanges}
        confirmDialog={confirmDialog}
        onChange={() => dispatch({ t: "reset" })}
      />
      <SettingsDivider />
      <SettingsItem
        label="Search"
        side={
          <div className="flex grow flex-row items-center justify-between gap-1">
            <Button
              className="btn btn-ghost btn-square btn-xs"
              onClick={() => helpFindingDialog.open()}
            >
              <PiQuestionFill className="size-4" />
            </Button>
            {settings.noteFindRegexpError.value && (
              <CustomTooltip
                content={
                  <p className="text-error max-w-[16ch] text-center text-wrap wrap-break-word">
                    Error:{" "}
                    {_.capitalize(settings.noteFindRegexpError.value.message)}
                  </p>
                }
              >
                <PiWarningOctagonFill className="text-error size-4" />
              </CustomTooltip>
            )}
          </div>
        }
        between={
          <>
            <Field className="flex flex-row items-center gap-x-2 text-sm">
              <Label className="inline-flex-center gap-x-1">
                <PiFlagBannerFill /> Flags
              </Label>
              <CustomListbox
                className="select select-xs grow text-xs"
                disabled={viewer.data == null}
                multiple
                value={settings.noteFindFlags.value}
                options={REGEXP_FLAGS}
                onChange={(v) => {
                  settings.noteFindFlags.set(v);
                }}
                buttonContents={
                  <div className="flex-center w-full">
                    <span className="text-success inline-block truncate font-mono">
                      /
                      {[...settings.noteFindFlags.value]
                        .sort(
                          (a, b) =>
                            REGEXP_FLAGS.indexOf(a) - REGEXP_FLAGS.indexOf(b),
                        )
                        .join("")}
                    </span>
                  </div>
                }
                optionContents={(value) => (
                  <div className="inline-flex flex-row items-center gap-x-1.5 text-xs">
                    <div
                      className={clsx(
                        !settings.noteFindFlags.value.includes(value) &&
                          "invisible",
                      )}
                    >
                      <PiCheckFatFill />
                    </div>
                    <div>
                      <span className="font-mono">{value}</span>{" "}
                      {nameOfRegExpFlag(value)}
                    </div>
                  </div>
                )}
              />
            </Field>
          </>
        }
      >
        <CodeEditor
          disabled={viewer.data == null}
          format={{
            type: "dangerouslySetInnerHTML",
            format: (src) => highlightToHtml(src, "source.js"),
          }}
          value={settings.noteFind.value}
          onChange={settings.noteFind.set}
        />
      </SettingsItem>
      <Field className="flex w-full flex-row items-center gap-x-2 text-sm">
        <Switch
          className="toggle toggle-primary duration-300 motion-reduce:transition-none"
          disabled={viewer.data == null}
          checked={settings.hideUnmatched.value}
          onChange={settings.hideUnmatched.set}
        />
        <Label>Hide Unmatched</Label>
      </Field>
      <SettingsItem
        label="Replace"
        side={
          <div className="flex grow flex-row items-center gap-1">
            <Button
              className="btn btn-ghost btn-square btn-xs"
              onClick={() => helpReplacingDialog.open()}
            >
              <PiQuestionFill className="size-4" />
            </Button>
          </div>
        }
        between={
          <Button
            disabled={viewer.data == null}
            className={clsx(
              "btn btn-sm btn-outline text-sm",
              settings.noteReplaceJavaScriptMode.value
                ? "btn-accent"
                : "btn-primary",
            )}
            onClick={() =>
              settings.noteReplaceJavaScriptMode.set(
                !settings.noteReplaceJavaScriptMode.value,
              )
            }
          >
            {settings.noteReplaceJavaScriptMode.value ? (
              <PiCodeBold />
            ) : (
              <PiCurrencyDollarBold />
            )}{" "}
            {settings.noteReplaceJavaScriptMode.value ? "Script" : "Regex"} Mode
          </Button>
        }
      >
        <CodeEditor
          disabled={viewer.data == null}
          format={{
            type: "dangerouslySetInnerHTML",
            format: settings.noteReplaceJavaScriptMode.value
              ? (src) => highlightToHtml(src, "source.js")
              : (src) => highlightReplacer(src),
          }}
          className="min-h-[calc(18px+20px*4)]"
          value={settings.noteReplace.value}
          onChange={settings.noteReplace.set}
        />
      </SettingsItem>
      <Button
        className="btn btn-outline btn-sm btn-secondary text-sm"
        disabled={viewer.data == null || !hasReplacement}
        onMouseOver={() => {
          settings.previewReplaceAll.set(true);
        }}
        onMouseLeave={() => {
          settings.previewReplaceAll.set(false);
        }}
        onTouchStart={() => {
          settings.previewReplaceAll.set(false);
        }}
        onClick={() => {
          dispatch({ t: "replaceAll" });
        }}
      >
        <PiSwapFill /> Replace All
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

function highlightReplacer(src: string) {
  return src.replaceAll(
    /(\$(?:\d+|<[A-Za-z0-9_]+>|\&|\$))|((?:.(?!\$))+)/g,
    (x, p1, p2) =>
      p1 ? `<span class="pl-k">${escapeHtml(x)}</span>` : escapeHtml(p2),
  );
}
