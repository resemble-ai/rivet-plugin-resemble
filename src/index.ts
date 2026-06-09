import type { RivetPlugin, RivetPluginInitializer } from '@ironclad/rivet-core'
import { resembleDetectNode } from './nodes/ResembleDetectNode.js'
import { resembleIntelligenceNode } from './nodes/ResembleIntelligenceNode.js'
import { resembleWatermarkNode } from './nodes/ResembleWatermarkNode.js'

const plugin: RivetPluginInitializer = (rivet) => {
  const resemblePlugin: RivetPlugin = {
    id: 'resemble',
    name: 'Resemble Detect + Intelligence',
    configSpec: {
      resembleApiKey: {
        type: 'secret',
        label: 'Resemble API Key',
        description: 'Your Resemble API key (dashboard → Account → API).',
        pullEnvironmentVariable: 'RESEMBLE_API_KEY',
        helperText: 'Create an API key in the Resemble dashboard.',
      },
      resembleBaseUrl: {
        type: 'string',
        label: 'API Base URL (optional)',
        description: 'Override only for self-hosted / enterprise.',
        helperText: 'Defaults to https://app.resemble.ai/api/v2',
      },
    },
    contextMenuGroups: [{ id: 'Resemble', label: 'Resemble' }],
    register: (register) => {
      register(resembleDetectNode(rivet))
      register(resembleIntelligenceNode(rivet))
      register(resembleWatermarkNode(rivet))
    },
  }
  return resemblePlugin
}

export default plugin
