import actTools from './act.js';
import extractTools from './extract.js';
import observeTools from './observe.js';
import agentTools from './agent.js';

const stagehandTools = [
  ...actTools,
  ...extractTools,
  ...observeTools,
  ...agentTools,
];

export default stagehandTools;