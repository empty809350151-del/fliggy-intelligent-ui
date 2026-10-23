import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
const client = new Client({name:'smoke',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('server.mjs',import.meta.url))]}));
try {
 const {tools}=await client.listTools();
 assert.equal(tools.length,3);
 const demo=await client.callTool({name:'show_ui_demo',arguments:{}});
 assert.ok(!demo.isError,JSON.stringify(demo));
 assert.ok(demo.structuredContent.program.includes('Slider'));
 const bad=await client.callTool({name:'render_intelligent_ui',arguments:{title:'invalid',program:'root = DoesNotExist()'}});
 assert.equal(bad.isError,true);
 const instructions=await client.callTool({name:'get_ui_instructions',arguments:{}});
 assert.ok(instructions.content[0].text.includes('Slider'));
 const resource=await client.readResource({uri:tools.find(t=>t.name==='show_ui_demo')._meta.ui.resourceUri});
 assert.equal(resource.contents[0].mimeType,'text/html;profile=mcp-app');
 assert.ok(resource.contents[0].text.includes('<script>'));
 console.log('PASS: discovery, valid program, invalid program rejection, instructions, bundled MCP App resource.');
} finally {await client.close();}
