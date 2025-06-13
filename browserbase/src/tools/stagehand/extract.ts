import { z } from 'zod'; 
import { Context } from '../../context.js';
import { defineTool, type ToolFactory } from '../tool.js'; 
import { initStagehand } from './util.js';

const extractTool: ToolFactory = captureSnapshot => defineTool({
  capability: 'stagehand',

  schema: {
    name: 'browserbase_stagehand_extract',
    description: 'Extract structured data from the page using Stagehand',
    inputSchema: z.object({
      instruction: z.string().describe('What data to extract from the page.'),
      schema: z.string().describe('JSON schema string defining the exact structure of data to extract'),
    }),
  },

  handle: async (context: Context, params) => {
    const page = await context.getActivePage();
    if (!page) {
      throw new Error('No active page found for extract');
    }

    const browserbaseSessionId = context.getBrowserbaseSessionId();
    const stagehand = await initStagehand(browserbaseSessionId);
    
    return {
      code: ['// Stagehand extract data operation performed'],
      action: async () => {
        // Parse the schema string into an actual object
        let parsedSchema;
        try {
          parsedSchema = JSON.parse(params.schema);
        } catch (error) {
          throw new Error(`Invalid schema format: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        const result = await stagehand.page.extract({
          instruction: params.instruction,
          schema: parsedSchema
        });
        
        return {
          content: [{
            type: 'text' as const,
            text: `Data extracted: \n${JSON.stringify(result, null, 2)}`
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
  extractTool(captureSnapshotValue),
];
