import fs from 'node:fs/promises';
import {createParser,parseMessage} from '@openuidev/lang-core';
const inputs=JSON.parse(await fs.readFile('scripts/scenarios/inputs.json','utf8'));
const spec=JSON.parse(await fs.readFile('src/generated/spec.json','utf8'));
const parser=createParser(spec.schema,spec.root);let failures=[];
for(const item of inputs){try{
 const saved=JSON.parse(await fs.readFile(`public/scenario-examples/${item.key}.json`,'utf8'));
 if(saved.prompt!==item.prompt)throw Error('prompt mismatch');
 const p=parser.parse(parseMessage(saved.program).content);
 if(!p.root||p.meta.errors.length||p.meta.incomplete||p.meta.unresolved.length)throw Error('invalid program');
 if(/\b(?:ToAssistant|Query|Mutation)\s*\(/.test(saved.program))throw Error('model or query action');
 const response=await fetch('http://localhost:3100/examples/'+item.key);
 if(!response.ok)throw Error('page HTTP '+response.status);
 console.log('PASS',item.key);
 }catch(e){failures.push(item.key);console.error('FAIL',item.key,String(e).slice(0,180))}}
console.log(`${inputs.length-failures.length}/${inputs.length} saved examples verified`);if(failures.length)process.exitCode=1;
