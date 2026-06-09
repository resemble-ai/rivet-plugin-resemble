import type {
  ChartNode, EditorDefinition, Inputs, InternalProcessContext, NodeBodySpec,
  NodeId, NodeInputDefinition, NodeOutputDefinition, NodeUIData, Outputs,
  PluginNodeImpl, PortId, Rivet,
} from '@ironclad/rivet-core'
import { watermarkApply, watermarkDetect } from '../client.js'

export type ResembleWatermarkNode = ChartNode<'resembleWatermark', ResembleWatermarkNodeData>
export type ResembleWatermarkNodeData = {
  url: string
  operation?: string
  strength?: number
  customMessage?: string
  maxWaitSeconds?: number
  useUrlInput?: boolean
}

export function resembleWatermarkNode(rivet: typeof Rivet) {
  const impl: PluginNodeImpl<ResembleWatermarkNode> = {
    create: (): ResembleWatermarkNode => ({
      id: rivet.newId<NodeId>(),
      data: { url: '', operation: 'detect', strength: 0.2, maxWaitSeconds: 120 },
      title: 'Resemble Watermark',
      type: 'resembleWatermark',
      visualData: { x: 0, y: 0, width: 250 },
    }),
    getInputDefinitions: (data): NodeInputDefinition[] =>
      data.useUrlInput ? [{ id: 'url' as PortId, dataType: 'string', title: 'Media URL' }] : [],
    getOutputDefinitions: (): NodeOutputDefinition[] => [{ id: 'result' as PortId, dataType: 'object', title: 'Result' }],
    getUIData: (): NodeUIData => ({
      contextMenuTitle: 'Resemble Watermark',
      group: 'Resemble',
      infoBoxBody: 'Apply or detect an invisible Resemble watermark (audio-first).',
      infoBoxTitle: 'Resemble Watermark',
    }),
    getEditors: (): EditorDefinition<ResembleWatermarkNode>[] => [
      { type: 'string', dataKey: 'url', useInputToggleDataKey: 'useUrlInput', label: 'Media URL' },
      { type: 'dropdown', dataKey: 'operation', label: 'Operation', options: [
        { value: 'detect', label: 'Detect' }, { value: 'apply', label: 'Apply' },
      ] },
      { type: 'number', dataKey: 'strength', label: 'Strength (apply)' },
      { type: 'string', dataKey: 'customMessage', label: 'Custom Message (apply)' },
      { type: 'number', dataKey: 'maxWaitSeconds', label: 'Max Wait (seconds)' },
    ],
    getBody: (data): string | NodeBodySpec | NodeBodySpec[] | undefined =>
      rivet.dedent`Resemble Watermark (${data.operation ?? 'detect'})
        URL: ${data.useUrlInput ? '(Using Input)' : data.url || '(none)'}`,
    async process(data, inputData: Inputs, context: InternalProcessContext): Promise<Outputs> {
      const url = rivet.getInputOrData(data, inputData, 'url', 'string')
      const apiKey = context.getPluginConfig('resembleApiKey')
      const baseUrl = context.getPluginConfig('resembleBaseUrl') || undefined
      if (!apiKey) throw new Error('Resemble API key not set. Configure it in the plugin settings.')
      const opts = { apiKey, baseUrl }
      const result =
        data.operation === 'apply'
          ? await watermarkApply(opts, { url, strength: data.strength, custom_message: data.customMessage, max_wait_seconds: data.maxWaitSeconds })
          : await watermarkDetect(opts, { url })
      return { ['result' as PortId]: { type: 'object', value: result } }
    },
  }
  return rivet.pluginNodeDefinition(impl, 'Resemble Watermark')
}
