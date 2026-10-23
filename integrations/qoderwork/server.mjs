import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { createParser } from '@openuidev/lang-core';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const spec = JSON.parse(await readFile(new URL('src/generated/spec.json', root), 'utf8'));
const parser = createParser(spec.schema, spec.root);
const uri = 'ui://open-intelligent-ui/app.html';
const server = new McpServer({ name: 'open-intelligent-ui', version: '1.0.0' }, {
 instructions: 'Render interactive answers inside QoderWork with OpenUI. First call get_ui_instructions, then write OpenUI Lang yourself and call render_intelligent_ui. No separate model/API key is needed. Use show_ui_demo to verify the integration.'
});
const demo = `root = Card([Title("旅行预算计算器", "lg"), Text("拖动滑块，预算会立即更新。"), Text("人数：" + $people), Slider($people, 1, 10, 1), Text("天数：" + $days), Slider($days, 1, 14, 1), Text("每人每天预算：¥" + $daily), Slider($daily, 100, 2000, 100), Divider(), Title("总预算：¥" + ($people * $days * $daily), "xl")])
$people = 2
$days = 3
$daily = 500`;
function result(program, title) {
 const parsed = parser.parse(program);
 const errors = parsed.meta.errors.map(e => e.message);
 if (!parsed.root || errors.length || parsed.meta.unresolved.length) return { isError: true, content: [{type:'text',text:JSON.stringify({errors,unresolved:parsed.meta.unresolved})}] };
 return {content:[{type:'text',text:JSON.stringify({program,title})}],structuredContent:{program,title}};
}
server.registerTool('get_ui_instructions', {description:'Read the OpenUI component syntax and examples before generating an interactive answer. Use Qoder’s own model to compose the program.',inputSchema:{}}, async()=>({content:[{type:'text',text:await readFile(new URL('src/generated/system-prompt.txt',root),'utf8')},{type:'text',text:'QoderWork embedding: use self-contained controls, calculations, charts, tables and SVG. Do not use SearchImage, Map, YouTube, HtmlView, Query or remote Image: those depend on network/backend features not enabled in this connector. Return your program through render_intelligent_ui. @ToAssistant sends a follow-up via the host. Keep answers in the user’s language.'}]}));
registerAppTool(server,'render_intelligent_ui',{description:'Display a working interactive OpenUI program INSIDE the conversation. First read get_ui_instructions. Supply valid OpenUI Lang, not HTML, JSX or Markdown.',inputSchema:{title:z.string().max(200),program:z.string().min(1).max(200000)},_meta:{ui:{resourceUri:uri}}},async({title,program})=>result(program,title));
registerAppTool(server,'show_ui_demo',{description:'Display an interactive Chinese travel budget calculator to test the Intelligent UI connection. No API key needed.',inputSchema:{},_meta:{ui:{resourceUri:uri}}},async()=>result(demo,'旅行预算计算器'));
registerAppResource(server,'Intelligent UI',uri,{},async()=>({contents:[{uri,mimeType:RESOURCE_MIME_TYPE,text:await readFile(new URL('dist/app.html',import.meta.url),'utf8'),_meta:{ui:{prefersBorder:true,csp:{connectDomains:[],resourceDomains:[]}}}}]}));
await server.connect(new StdioServerTransport());
