# QoderWork Intelligent UI connector

This local stdio MCP server embeds the project's OpenUI renderer as an MCP App.
QoderWork generates the OpenUI program using its own model. No DeepSeek key,
Ollama, Next.js server, or additional model subscription is required by the connector.

## Build and install

From the repository root (Node 24+):

```sh
npm ci
npm run qoder:build
npm run qoder:test
```

In QoderWork → Extensions → Connectors → Add → Paste JSON Config, import:

```json
{
  "mcpServers": {
    "open-intelligent-ui": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/open-intelligent-ui/integrations/qoderwork/server.mjs"]
    }
  }
}
```

Use an absolute executable path. Keep this checkout and its node_modules in place.
QoderWork starts the server itself. Rebuild after component changes.

## Usage

First test: `调用 open-intelligent-ui 的 show_ui_demo，在对话中显示旅行预算计算器。`

Custom answer: `用 open-intelligent-ui 做一个可交互的旅行预算表。先读取 get_ui_instructions，再调用 render_intelligent_ui。`

Tools:
- `get_ui_instructions`: component syntax, functions and worked examples.
- `render_intelligent_ui`: validates and displays a generated OpenUI program.
- `show_ui_demo`: self-contained interactive budget calculator.

Local controls and calculations work within the UI; @ToAssistant uses the host's
message API and @OpenUrl uses the host's link API. The connector has no backend
business tools or cloud persistence. State may reset if the host recreates the view.
This initial integration supports text, layouts, controls, tables, charts and SVG.
SearchImage, Map, YouTube, HtmlView, Query and remote Image are not supported in
this embedding. Use other QoderWork connectors to retrieve data, then pass that
data into tables/charts. Do not represent demo data as live business data.

To uninstall, remove open-intelligent-ui from QoderWork's Installed connectors.
The original web app and its separate .env.local settings are unaffected.

## Verified on this machine

2026-10-19: imported through QoderWork's JSON connector UI, enabled, and all
three tools discovered. show_ui_demo rendered inline in the conversation.
Increasing the people slider from 2 to 3 changed total budget from ¥3000 to
¥4500 without another model call. Type checking and the MCP smoke test pass.

Compatibility: return the program in both structuredContent and JSON text
content. This QoderWork version can omit structuredContent while forwarding
results through the agent. The frontend accepts either representation.
After first import, if tools are not discoverable, toggle this connector off
and back on in Installed connectors, then retry. No app restart was needed.
