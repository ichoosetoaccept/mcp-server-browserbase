import { z } from 'zod'; 
import { Context } from '../../context.js';
import { defineTool, type ToolFactory } from '../tool.js'; 
import { initStagehand } from './util.js';

const actTool: ToolFactory = captureSnapshot => defineTool({
  capability: 'stagehand',

  schema: {
    name: 'browserbase_stagehand_act',
    description: `Performs an action on a web page element. Act actions should be as atomic and 
      specific as possible, i.e. "Click the sign in button" or "Type 'hello' into the search input". 
      AVOID actions that are more than one step, i.e. "Order me pizza" or "Send an email to Paul 
      asking him to call me".`,
    inputSchema: z.object({
      action: z.string().describe(`The action to perform. Should be as atomic and specific as possible, 
          i.e. 'Click the sign in button' or 'Type 'hello' into the search input'. AVOID actions that are more than one 
          step, i.e. 'Order me pizza' or 'Send an email to Paul asking him to call me'. The instruction should be just as specific as possible, 
          and have a strong correlation to the text on the page. If unsure, use observe before using act.`),
      variables: z.record(z.string()).describe(`Variables used in the action template. ONLY use variables if you\'re dealing 
          with sensitive data or dynamic content. For example, if you\'re logging in to a website, 
          you can use a variable for the password. When using variables, you MUST have the variable
          key in the action template. For example: {"action": "Fill in the password", "variables": {"password": "123456"}}`),
    }),
  },

  handle: async (context: Context, params) => {
    const page = await context.getActivePage();
    if (!page) {
      throw new Error('No active page found for act');
    }

    const browserbaseSessionId = context.getBrowserbaseSessionId();
    const stagehand = await initStagehand(browserbaseSessionId);
    
    return {
      code: ['// Stagehand act action performed'],
      action: async () => {
        const result = await stagehand.page.act(
          {
            action: params.action,
            variables: params.variables
          }
        );
        return {
          content: [{
            type: 'text' as const,
            text: `Action completed: \nAction: ${params.action}. \nVariables: ${JSON.stringify(params.variables, null, 2)}. \nResult: ${JSON.stringify(result, null, 2)}`
          }]
        };
      },
      captureSnapshot, 
      waitForNetwork: true 
    };
  },
});

const captureSnapshotValue = true;

export default [
  actTool(captureSnapshotValue),
]; 