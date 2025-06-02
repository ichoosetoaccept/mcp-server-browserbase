import { ServerList } from './server.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export async function startStdioTransport(serverList: ServerList) {
  const server = await serverList.create();
  await server.connect(new StdioServerTransport());
}