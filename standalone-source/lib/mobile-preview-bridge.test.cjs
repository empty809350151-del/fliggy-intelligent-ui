const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
test('preview relays only trusted parent and child, preserving request IDs',async()=>{
 const sent=[],parent={postMessage:(m,o)=>sent.push(['parent',m,o])},child={postMessage:(m,o)=>sent.push(['child',m,o])};let receive;
 const context={window:{parent,addEventListener:(_,fn)=>receive=fn},location:{origin:'http://localhost:3100'},document:{documentElement:{classList:{add(){}}},querySelector:()=>({contentWindow:child})},fetch:async()=>({ok:true,json:async()=>['http://127.0.0.1:8767']})};
 await vm.runInNewContext(fs.readFileSync('public/mobile-preview-bridge.js','utf8'),context);
 const message={type:'fliggy:send',requestId:'test-1',text:'hello',newChat:false};
 receive({source:parent,origin:'https://untrusted.test',data:message});
 receive({source:{},origin:'http://127.0.0.1:8767',data:message});assert.equal(sent.length,0);
 receive({source:parent,origin:'http://127.0.0.1:8767',data:message});assert.deepEqual(sent[0],['child',message,'http://localhost:3100']);
 for(const type of ['fliggy:ready','fliggy:accepted','fliggy:completed','fliggy:error']){
 const data={type,requestId:'test-1'};receive({source:child,origin:'http://localhost:3100',data});assert.deepEqual(sent.at(-1),['parent',data,'http://127.0.0.1:8767']);
 }
 const count=sent.length;receive({source:{},origin:'http://localhost:3100',data:{type:'fliggy:completed'}});assert.equal(sent.length,count);
});
