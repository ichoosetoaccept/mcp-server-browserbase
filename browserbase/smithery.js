#!/usr/bin/env node

import createServerFunction from './src/index.js';
import { createStatefulServer } from '@smithery/sdk/server/stateful.js'

import { ServerList } from './src/server.js';

export default async function main({ config }) {
  const serverList = new ServerList(async() => {
    return createServerFunction({ config });
    });
    setupExitWatchdog(serverList);

  return createStatefulServer(() => createServerFunction({ config })).app.listen(process.env.PORT || 8081, () => {
    console.log(`Server is running on port ${process.env.PORT || 8081}`);
  })
}

function setupExitWatchdog(serverList) {
  const handleExit = async () => {
    setTimeout(() => process.exit(0), 15000);
    await serverList.closeAll();
    process.exit(0);
  };

  process.stdin.on('close', handleExit);
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

main({})