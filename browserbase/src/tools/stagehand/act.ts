import { z } from 'zod'; 
import { Context } from '../../context.js';
import { defineTool, type ToolFactory } from '../tool.js'; 
import { initStagehand } from './util.js';

const actTool: ToolFactory = captureSnapshot => defineTool({
  capability: 'stagehand',

  schema: {
    name: 'browserbase_stagehand_act',
    description: 'Perform an atomic action on the page using Stagehand',
    inputSchema: z.object({
      instructions: z.string().describe('The atomic action to perform on the page'),
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
        const result = await stagehand.page.act(params.instructions);
        return {
          content: [{
            type: 'text' as const,
            text: `Action completed: \n${params.instructions}. \nResult: ${JSON.stringify(result, null, 2)}`
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