import { Stagehand } from "@browserbasehq/stagehand";

export async function initStagehand(browserbaseSessionID: string): Promise<Stagehand> {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    browserbaseSessionID,
  });

  await stagehand.init();

  return stagehand;
}
