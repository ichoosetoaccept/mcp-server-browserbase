import { Stagehand } from "@browserbasehq/stagehand";
import { Context } from "../../context.js";

export async function initStagehand(context: Context, browserbaseSessionID: string): Promise<Stagehand> {
    const { 
        browserbaseApiKey, 
        browserbaseProjectId,
    } = context.config;

  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: browserbaseApiKey,
    projectId: browserbaseProjectId,
    browserbaseSessionID,
  });

  await stagehand.init();

  return stagehand;
}
