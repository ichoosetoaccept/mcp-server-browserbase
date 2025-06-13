import { z } from 'zod'; 
import { Context } from '../../context.js';
import { defineTool, type ToolFactory } from '../tool.js'; 
import { initStagehand } from './util.js';

const observeTool: ToolFactory = captureSnapshot => defineTool({
  capability: 'stagehand',

  schema: {
    name: 'browserbase_stagehand_observe',
    description: 'Observes elements on the web page. Use this tool to observe elements that you can later use in an action. Use observe instead of extract when dealing with actionable (interactable) elements rather than text. More often than not, you\'ll want to use extract instead of observe when dealing with scraping or extracting structured text.',
    inputSchema: z.object({
      instruction: z.string().describe('Instruction for observation (e.g., \'find the login button\'). This instruction must be extremely specific.'),
    }),
  },

  handle: async (context: Context, params) => {
    const page = await context.getActivePage();
    if (!page) {
      throw new Error('No active page found for observe');
    }

    const browserbaseSessionId = context.getBrowserbaseSessionId();
    const stagehand = await initStagehand(browserbaseSessionId);
    
    return {
      code: ['// Stagehand observe operation performed'],
      action: async () => {
        const result = await stagehand.page.observe(params.instruction);
        
        return {
          content: [{
            type: 'text' as const,
            text: `Observed actions: \n${JSON.stringify(result, null, 2)}`
          }]
        };
      },
      captureSnapshot, 
      waitForNetwork: false 
    };
  },
});

const captureSnapshotValue = true;

export default [
  observeTool(captureSnapshotValue),
];
