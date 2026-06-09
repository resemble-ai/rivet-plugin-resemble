# rivet-plugin-resemble

A [Rivet](https://rivet.ironcladapp.com) plugin for **Resemble AI** media safety:
deepfake detection, media intelligence, and watermarking. Scope: Detect + Intelligence
only (no TTS / voice cloning).

## Nodes
- **Resemble Detect** — deepfake detection (audio/image/video) with toggles for
  intelligence, audio source tracing, visualize, and model type.
- **Resemble Intelligence** — transcription, translation, speaker info, emotion, misinformation.
- **Resemble Watermark** — apply or detect an invisible provenance watermark (audio-first).

## Configuration
In Rivet → Plugins → Resemble, set your **Resemble API Key** (or the `RESEMBLE_API_KEY`
env var). Optionally override the API Base URL for self-hosted / enterprise.

## Install
In Rivet, add the plugin by npm package name `rivet-plugin-resemble`, or build locally:

```bash
npm install
npm run build   # -> dist/bundle.js
```

## Notes
- Detection is asynchronous; the Detect node polls to completion (bounded by *Max Wait*).
- Media must be a public HTTPS URL. Large inline base64 artifacts are stripped from output.
- The HTTP client (`src/client.ts`) is the same logic verified live against the Resemble API.
- Alternatively, Rivet's built-in **MCP** nodes can reach Resemble via the hosted Resemble
  MCP server with zero plugin install.

## License
MIT
