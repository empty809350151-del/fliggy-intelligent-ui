import {createParser, parseMessage, type Library} from '@openuidev/react-lang';
export type OutputEvidence = {version:1; valid:boolean; components:{name:string;path:string;dynamic:boolean}[]; states:string[]; issues:string[]; interactionVerified:false};
// Parse with the same schema as the renderer; never execute generated actions.
export function inspectOutput(raw:string,library:Library):OutputEvidence {
 const report:OutputEvidence={version:1,valid:false,components:[],states:[],issues:[],interactionVerified:false};
 try {
  const schema=library.toJSONSchema();
  const content=parseMessage(raw).content;
  const parsed=createParser(schema).parse(content);
  report.valid=!!parsed.root&&!parsed.meta.incomplete&&!parsed.meta.errors.length&&!parsed.meta.unresolved.length;
  report.issues=[...parsed.meta.errors.map(e=>String(e.message)),...parsed.meta.unresolved.map(x=>'未定义引用：'+x)];
  if(parsed.meta.incomplete)report.issues.push('程序未完整生成');
  if(!parsed.root)report.issues.push('未解析到界面根节点');
  report.states=Object.keys(parsed.stateDeclarations);
  const seen=new WeakSet<object>();
  function walk(value:unknown,path:string){
   if(!value||typeof value!=='object'||seen.has(value))return;
   seen.add(value);const v=value as Record<string,unknown>;
   if(v.type==='element'&&typeof v.typeName==='string')report.components.push({name:v.typeName,path,dynamic:v.hasDynamicProps!==false});
   for(const [key,child]of Object.entries(v))walk(child,path+'.'+key);
  }
  // Only walk the root-reachable tree; orphan declarations are not assets in use.
  // A recoverable schema error must not erase the entire visible component tree.
  // Keep valid=false and issues so consumers distinguish detection from validation.
  if(report.valid)walk(parsed.root,'root');
  else {
   // Parse structure separately without field constraints. This never promotes an
   // invalid program to valid, executes actions, or accepts unregistered names.
   const structuralSchema=structuredClone(schema);
   for(const name of Object.keys(schema.properties??{})) {
    const def=structuralSchema.$defs?.[name];
    if(def?.properties) {
     def.properties=Object.fromEntries(Object.keys(def.properties).map(key=>[key,{}]));
     def.required=[];
    }
   }
   const structural=createParser(structuralSchema).parse(content);
   if(structural.root)walk(structural.root,'root');
  }
 }catch{report.issues.push('生成程序无法解析，无法确认组件资产')}
 return report;
}
