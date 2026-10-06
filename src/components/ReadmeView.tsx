import { Action, ActionPanel, Detail, Icon, List, open, showToast, Toast, useNavigation } from "@raycast/api";
import { readFile } from "fs/promises";
import path from "path";
import { useEffect } from "react";

import { useCachedPromise } from "@/hooks/useCachedPromise";
import { findReadmePath } from "@/utils/readme";

interface ReadmeViewProps {
  appId?: string;
  appName?: string;
  projectName: string;
  projectPath: string;
}

export default function ReadmeView({ appId, appName, projectName, projectPath }: ReadmeViewProps) {
  const { pop } = useNavigation();
  const { data, error, isLoading, revalidate } = useCachedPromise(loadReadme, [projectPath]);

  useEffect(() => {
    if (!error || isLoading || data) {
      return;
    }

    void showToast({ message: error.message, style: Toast.Style.Failure, title: "Couldn't load README" });
  }, [data, error, isLoading]);

  if (!isLoading && (error || !data)) {
    return (
      <List navigationTitle={`README · ${projectName}`}>
        <List.EmptyView
          actions={
            <ActionPanel>
              <Action icon={Icon.ArrowClockwise} onAction={revalidate} title="Retry" />
              <Action icon={Icon.ArrowLeft} onAction={pop} title="Go Back" />
            </ActionPanel>
          }
          description={error ? error.message : "This project has no README file."}
          title={error ? "Couldn't Load README" : "No README Found"}
        />
      </List>
    );
  }

  return (
    <Detail
      actions={
        data ? (
          <ActionPanel>
            <Action
              icon={Icon.AppWindow}
              onAction={() => open(data.fullPath, appId)}
              title={appName ? `Open in ${appName}` : "Open in Default App"}
            />
            <Action.CopyToClipboard content={data.fullPath} icon={Icon.CopyClipboard} title="Copy README Path" />
          </ActionPanel>
        ) : undefined
      }
      markdown={data?.contents ?? "Loading README…"}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label text={projectName} title="Project" />
          <Detail.Metadata.Label text={data?.fileName ?? "…"} title="File" />
          <Detail.Metadata.Label text={projectPath} title="Path" />
        </Detail.Metadata>
      }
      navigationTitle={`README · ${projectName}`}
    />
  );
}

async function loadReadme(
  projectPath: string,
): Promise<null | { contents: string; fileName: string; fullPath: string }> {
  const readmePath = await findReadmePath(projectPath);
  if (!readmePath) {
    return null;
  }

  const contents = await readFile(readmePath, "utf-8");
  return { contents, fileName: path.basename(readmePath), fullPath: readmePath };
}
