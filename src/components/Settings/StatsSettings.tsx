import { Action, ActionPanel, Alert, Color, confirmAlert, Icon, List, showToast, Toast } from "@raycast/api";
import path from "path";
import { useState } from "react";

import {
  formatInstalledSince,
  projectDisplayName,
  type RankedProject,
  type UsagePeriod,
  type UsageSnapshot,
} from "@/utils/usage";

interface StatsSettingsProps {
  gitRepoCount: number;
  onClearUsage: () => Promise<void>;
  projectCount: number;
  snapshot: UsageSnapshot;
  workspaceCount: number;
}

export default function StatsSettings({
  gitRepoCount,
  onClearUsage,
  projectCount,
  snapshot,
  workspaceCount,
}: StatsSettingsProps) {
  const top = snapshot.mostOpened.all;

  const clearStats = async () => {
    if (
      !(await confirmAlert({
        message: "This clears open history used for statistics. Workspaces and pins are kept.",
        primaryAction: { style: Alert.ActionStyle.Destructive, title: "Clear Statistics" },
        title: "Clear Statistics",
      }))
    ) {
      return;
    }

    await onClearUsage();
    await showToast({ style: Toast.Style.Success, title: "Statistics cleared" });
  };

  return (
    <List.Item
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Statistics">
            <Action.Push
              icon={Icon.BarChart}
              target={
                <StatsDetailView
                  gitRepoCount={gitRepoCount}
                  onClearUsage={clearStats}
                  projectCount={projectCount}
                  snapshot={snapshot}
                  workspaceCount={workspaceCount}
                />
              }
              title="Open Statistics"
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="Reset">
            <Action icon={Icon.Trash} onAction={clearStats} style={Action.Style.Destructive} title="Clear Statistics" />
          </ActionPanel.Section>
        </ActionPanel>
      }
      detail={
        <List.Item.Detail
          markdown={summaryMarkdown(snapshot, projectCount, workspaceCount, gitRepoCount)}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label text={String(projectCount)} title="Projects listed" />
              <List.Item.Detail.Metadata.Label text={String(workspaceCount)} title="Workspaces" />
              <List.Item.Detail.Metadata.Label text={String(gitRepoCount)} title="Git repos" />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label text={String(snapshot.totalOpens)} title="Total opens" />
              <List.Item.Detail.Metadata.Label text={formatInstalledSince(snapshot.installedAt)} title="Installed" />
              <List.Item.Detail.Metadata.Label
                text={top ? `${projectDisplayName(top.path)} (${top.count})` : "-"}
                title="Most opened"
              />
            </List.Item.Detail.Metadata>
          }
        />
      }
      icon={Icon.BarChart}
      id="statistics"
      keywords={["stats", "statistics", "usage", "opens", "most opened"]}
      title="Statistics"
    />
  );
}

function RankedProjectItem({ entry, period, rank }: { entry: RankedProject; period: UsagePeriod; rank: number }) {
  const name = projectDisplayName(entry.path);
  return (
    <List.Item
      accessories={[{ tag: { color: rank === 1 ? Color.Yellow : Color.SecondaryText, value: `#${rank}` } }]}
      detail={
        <List.Item.Detail
          markdown={`**${name}**\n\n\`${entry.path}\`\n\nOpened **${entry.count}** time${entry.count === 1 ? "" : "s"} ${periodLabel(period)}.`}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label text={String(entry.count)} title="Opens" />
              <List.Item.Detail.Metadata.Label text={periodTitle(period)} title="Period" />
              <List.Item.Detail.Metadata.Label text={entry.path} title="Path" />
              <List.Item.Detail.Metadata.Label text={new Date(entry.lastOpened).toLocaleString()} title="Last opened" />
            </List.Item.Detail.Metadata>
          }
        />
      }
      icon={Icon.Folder}
      keywords={[name, entry.path, path.basename(path.dirname(entry.path))]}
      subtitle={`${entry.count} open${entry.count === 1 ? "" : "s"}`}
      title={name}
    />
  );
}

function StatsDetailView({ gitRepoCount, onClearUsage, projectCount, snapshot, workspaceCount }: StatsSettingsProps) {
  const [period, setPeriod] = useState<UsagePeriod>("week");
  const ranked = snapshot.topProjects[period];
  const opens = snapshot.opensInPeriod[period];
  const top = snapshot.mostOpened[period];

  return (
    <List
      isShowingDetail
      navigationTitle="Statistics"
      searchBarAccessory={
        <List.Dropdown onChange={(value) => setPeriod(value as UsagePeriod)} tooltip="Period" value={period}>
          {PERIOD_OPTIONS.map((option) => (
            <List.Dropdown.Item icon={option.icon} key={option.period} title={option.title} value={option.period} />
          ))}
        </List.Dropdown>
      }
      searchBarPlaceholder="Search projects…"
    >
      <List.Section title="Overview">
        <List.Item
          actions={
            <ActionPanel>
              <Action
                icon={Icon.Trash}
                onAction={onClearUsage}
                style={Action.Style.Destructive}
                title="Clear Statistics"
              />
            </ActionPanel>
          }
          detail={
            <List.Item.Detail
              markdown={periodOverviewMarkdown(snapshot, period, projectCount, workspaceCount, gitRepoCount)}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label text={periodTitle(period)} title="Period" />
                  <List.Item.Detail.Metadata.Label text={String(opens)} title="Opens" />
                  <List.Item.Detail.Metadata.Label text={String(ranked.length)} title="Projects opened" />
                  <List.Item.Detail.Metadata.Label
                    text={top ? `${projectDisplayName(top.path)} (${top.count})` : "-"}
                    title="Top project"
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label text={String(projectCount)} title="Projects listed" />
                  <List.Item.Detail.Metadata.Label text={String(workspaceCount)} title="Workspaces" />
                  <List.Item.Detail.Metadata.Label text={String(gitRepoCount)} title="Git repos" />
                  <List.Item.Detail.Metadata.Label
                    text={String(snapshot.projectsTracked)}
                    title="Projects ever opened"
                  />
                  <List.Item.Detail.Metadata.Label
                    text={formatInstalledSince(snapshot.installedAt)}
                    title="Installed"
                  />
                </List.Item.Detail.Metadata>
              }
            />
          }
          icon={Icon.BarChart}
          subtitle={`${opens} open${opens === 1 ? "" : "s"} · ${periodTitle(period)}`}
          title="Overview"
        />
      </List.Section>

      <List.Section title={`Most opened · ${periodTitle(period).toLowerCase()}`}>
        {ranked.length === 0 ? (
          <List.Item icon={Icon.Minus} subtitle={`No opens ${periodLabel(period)} yet`} title="Nothing here yet" />
        ) : (
          ranked.map((entry, index) => (
            <RankedProjectItem entry={entry} key={`${period}-${entry.path}`} period={period} rank={index + 1} />
          ))
        )}
      </List.Section>
    </List>
  );
}

const PERIOD_OPTIONS: { icon: Icon; period: UsagePeriod; title: string }[] = [
  { icon: Icon.Clock, period: "day", title: "Today" },
  { icon: Icon.Calendar, period: "week", title: "This week" },
  { icon: Icon.Calendar, period: "month", title: "This month" },
  { icon: Icon.Calendar, period: "year", title: "This year" },
  { icon: Icon.BarChart, period: "all", title: "All time" },
];

function periodLabel(period: UsagePeriod): string {
  switch (period) {
    case "all":
      return "all time";
    case "day":
      return "today";
    case "month":
      return "this month";
    case "week":
      return "this week";
    case "year":
      return "this year";
  }
}

function periodOverviewMarkdown(
  snapshot: UsageSnapshot,
  period: UsagePeriod,
  projectCount: number,
  workspaceCount: number,
  gitRepoCount: number,
): string {
  const opens = snapshot.opensInPeriod[period];
  const top = snapshot.mostOpened[period];
  return [
    `Opens **${periodLabel(period)}**.`,
    "",
    `- **${opens}** open${opens === 1 ? "" : "s"}`,
    `- **${snapshot.topProjects[period].length}** project${snapshot.topProjects[period].length === 1 ? "" : "s"} opened`,
    top ? `- Top: **${projectDisplayName(top.path)}** (${top.count})` : "- No opens in this period yet",
    "",
    `_Catalog: ${projectCount} projects · ${workspaceCount} workspaces · ${gitRepoCount} git repos_`,
  ].join("\n");
}

function periodTitle(period: UsagePeriod): string {
  switch (period) {
    case "all":
      return "All time";
    case "day":
      return "Today";
    case "month":
      return "This month";
    case "week":
      return "This week";
    case "year":
      return "This year";
  }
}

function summaryMarkdown(
  snapshot: UsageSnapshot,
  projectCount: number,
  workspaceCount: number,
  gitRepoCount: number,
): string {
  const top = snapshot.mostOpened.all;
  return [
    "Usage since this extension was installed on this machine.",
    "",
    `- **${projectCount}** projects listed across **${workspaceCount}** workspace${workspaceCount === 1 ? "" : "s"}`,
    `- **${gitRepoCount}** git repositories`,
    `- **${snapshot.totalOpens}** opens tracked`,
    `- Installed for **${formatInstalledSince(snapshot.installedAt)}**`,
    top ? `- Most opened all time: **${projectDisplayName(top.path)}** (${top.count})` : "- No opens recorded yet",
  ].join("\n");
}
