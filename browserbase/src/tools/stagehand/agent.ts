import { z } from 'zod';
import { Context } from '../../context.js';
import { defineTool, type ToolFactory } from '../tool.js';
import { initStagehand } from './util.js';
import { AgentConfig } from '@browserbasehq/stagehand';

// The Stagehand agent tool enables complex, multi-step autonomous interactions in the browser.
const agentTool: ToolFactory = captureSnapshot => defineTool({
  capability: 'stagehand',

  schema: {
    name: 'browserbase_stagehand_agent',
    description: `
    Use the Stagehand agent primitive to autonomously accomplish a high-level goal in the active browser session.
    Use this tool only when standard Stagehand tools are insufficient for complex, multi-step tasks.
    `,
    inputSchema: z.object({
      instruction: z
        .string()
        .describe(
          'High-level task for the agent to complete, e.g., "Navigate to GitHub and open the latest Stagehand pull request".'
        ),
      systemPrompt: z
        .string()
        .optional()
        .describe('Optional detailed system prompt providing extensive context, guidelines, and constraints to steer the agent more effectively.'),
      instructions: z
        .string()
        .describe('Step-by-step instructions for the agent to ensure all necessary actions are fully executed.'),
    }),
  },

  handle: async (context: Context, params) => {
    const page = await context.getActivePage();
    if (!page) {
      throw new Error('No active page found for agent');
    }

    const browserbaseSessionId = context.getBrowserbaseSessionId();
    const stagehand = await initStagehand(context, browserbaseSessionId);

    // Build agent options only from supplied params to avoid overriding Stagehand defaults unintentionally.
    const agentOptions: AgentConfig = {
      model: 'computer-use-preview',
      instructions: params.systemPrompt || 'You are a helpful assistant that can use a web browser.',
      options: { 
        apiKey: context.config.openaiApiKey || process.env.OPENAI_API_KEY,
      },
    };

    return {
      code: ['// Stagehand agent execution triggered'],
      action: async () => {
        const agent = stagehand.agent(agentOptions);

        const result = await agent.execute(params.instruction);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Agent execution complete:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      },
      captureSnapshot,
      waitForNetwork: true,
    };
  },
});

const captureSnapshotValue = true;

export default [agentTool(captureSnapshotValue)];
