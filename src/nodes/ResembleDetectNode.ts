import type {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Project,
  Rivet,
} from '@ironclad/rivet-core'
import { detect } from '../client.js'

export type ResembleDetectNode = ChartNode<'resembleDetect', ResembleDetectNodeData>

export type ResembleDetectNodeData = {
  url: string
  runIntelligence?: boolean
  audioSourceTracing?: boolean
  visualize?: boolean
  modelTypes?: string
  maxWaitSeconds?: number
  useUrlInput?: boolean
}

export function resembleDetectNode(rivet: typeof Rivet) {
  const impl: PluginNodeImpl<ResembleDetectNode> = {
    create(): ResembleDetectNode {
      return {
        id: rivet.newId<NodeId>(),
        data: { url: '', runIntelligence: false, audioSourceTracing: false, modelTypes: 'auto', maxWaitSeconds: 120 },
        title: 'Resemble Detect',
        type: 'resembleDetect',
        visualData: { x: 0, y: 0, width: 250 },
      }
    },
    getInputDefinitions(data: ResembleDetectNodeData): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = []
      if (data.useUrlInput) inputs.push({ id: 'url' as PortId, dataType: 'string', title: 'Media URL' })
      return inputs
    },
    getOutputDefinitions(): NodeOutputDefinition[] {
      return [
        { id: 'result' as PortId, dataType: 'object', title: 'Result' },
        { id: 'label' as PortId, dataType: 'string', title: 'Label' },
      ]
    },
    getUIData(): NodeUIData {
      return {
        contextMenuTitle: 'Resemble Detect',
        group: 'Resemble',
        infoBoxBody: 'Deepfake detection on audio, image, or video via Resemble AI.',
        infoBoxTitle: 'Resemble Deepfake Detection',
      }
    },
    getEditors(): EditorDefinition<ResembleDetectNode>[] {
      return [
        { type: 'string', dataKey: 'url', useInputToggleDataKey: 'useUrlInput', label: 'Media URL' },
        { type: 'toggle', dataKey: 'runIntelligence', label: 'Run Intelligence' },
        { type: 'toggle', dataKey: 'audioSourceTracing', label: 'Audio Source Tracing' },
        { type: 'toggle', dataKey: 'visualize', label: 'Visualize' },
        { type: 'dropdown', dataKey: 'modelTypes', label: 'Model Type', options: [
          { value: 'auto', label: 'Auto' }, { value: 'image', label: 'Image' }, { value: 'talking_head', label: 'Talking Head' },
        ] },
        { type: 'number', dataKey: 'maxWaitSeconds', label: 'Max Wait (seconds)' },
      ]
    },
    getBody(data: ResembleDetectNodeData): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`Resemble Detect
        URL: ${data.useUrlInput ? '(Using Input)' : data.url || '(none)'}`
    },
    async process(data: ResembleDetectNodeData, inputData: Inputs, context: InternalProcessContext): Promise<Outputs> {
      const url = rivet.getInputOrData(data, inputData, 'url', 'string')
      const apiKey = context.getPluginConfig('resembleApiKey')
      const baseUrl = context.getPluginConfig('resembleBaseUrl') || undefined
      if (!apiKey) throw new Error('Resemble API key not set. Configure it in the plugin settings.')
      const result = await detect(
        { apiKey, baseUrl },
        {
          url,
          run_intelligence: data.runIntelligence,
          audio_source_tracing: data.audioSourceTracing,
          visualize: data.visualize,
          model_types: data.modelTypes,
          max_wait_seconds: data.maxWaitSeconds,
        }
      )
      const item = (result && (result.item ?? result)) || {}
      const m = item.metrics || item.image_metrics || item.video_metrics || {}
      return {
        ['result' as PortId]: { type: 'object', value: result },
        ['label' as PortId]: { type: 'string', value: String(m.label ?? 'unknown') },
      }
    },
  }
  return rivet.pluginNodeDefinition(impl, 'Resemble Detect')
}
