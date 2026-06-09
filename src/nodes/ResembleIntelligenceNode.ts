import type {
  ChartNode, EditorDefinition, Inputs, InternalProcessContext, NodeBodySpec,
  NodeId, NodeInputDefinition, NodeOutputDefinition, NodeUIData, Outputs,
  PluginNodeImpl, PortId, Rivet,
} from '@ironclad/rivet-core'
import { intelligence } from '../client.js'

export type ResembleIntelligenceNode = ChartNode<'resembleIntelligence', ResembleIntelligenceNodeData>
export type ResembleIntelligenceNodeData = {
  url: string
  mediaType?: string
  maxWaitSeconds?: number
  useUrlInput?: boolean
}

export function resembleIntelligenceNode(rivet: typeof Rivet) {
  const impl: PluginNodeImpl<ResembleIntelligenceNode> = {
    create: (): ResembleIntelligenceNode => ({
      id: rivet.newId<NodeId>(),
      data: { url: '', mediaType: 'auto', maxWaitSeconds: 120 },
      title: 'Resemble Intelligence',
      type: 'resembleIntelligence',
      visualData: { x: 0, y: 0, width: 250 },
    }),
    getInputDefinitions: (data): NodeInputDefinition[] =>
      data.useUrlInput ? [{ id: 'url' as PortId, dataType: 'string', title: 'Media URL' }] : [],
    getOutputDefinitions: (): NodeOutputDefinition[] => [{ id: 'result' as PortId, dataType: 'object', title: 'Analysis' }],
    getUIData: (): NodeUIData => ({
      contextMenuTitle: 'Resemble Intelligence',
      group: 'Resemble',
      infoBoxBody: 'Transcription, translation, speaker info, emotion, and misinformation analysis.',
      infoBoxTitle: 'Resemble Media Intelligence',
    }),
    getEditors: (): EditorDefinition<ResembleIntelligenceNode>[] => [
      { type: 'string', dataKey: 'url', useInputToggleDataKey: 'useUrlInput', label: 'Media URL' },
      { type: 'dropdown', dataKey: 'mediaType', label: 'Media Type', options: [
        { value: 'auto', label: 'Auto' }, { value: 'audio', label: 'Audio' }, { value: 'video', label: 'Video' }, { value: 'image', label: 'Image' },
      ] },
      { type: 'number', dataKey: 'maxWaitSeconds', label: 'Max Wait (seconds)' },
    ],
    getBody: (data): string | NodeBodySpec | NodeBodySpec[] | undefined =>
      rivet.dedent`Resemble Intelligence
        URL: ${data.useUrlInput ? '(Using Input)' : data.url || '(none)'}`,
    async process(data, inputData: Inputs, context: InternalProcessContext): Promise<Outputs> {
      const url = rivet.getInputOrData(data, inputData, 'url', 'string')
      const apiKey = context.getPluginConfig('resembleApiKey')
      const baseUrl = context.getPluginConfig('resembleBaseUrl') || undefined
      if (!apiKey) throw new Error('Resemble API key not set. Configure it in the plugin settings.')
      const result = await intelligence({ apiKey, baseUrl }, { url, media_type: data.mediaType, max_wait_seconds: data.maxWaitSeconds })
      return { ['result' as PortId]: { type: 'object', value: result } }
    },
  }
  return rivet.pluginNodeDefinition(impl, 'Resemble Intelligence')
}
