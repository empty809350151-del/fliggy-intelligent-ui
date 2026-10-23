import {it,expect,vi} from 'vitest';
import {createEmbedController} from './embed-controller';
const request={type:'fliggy:send' as const,requestId:'one',text:'hello',newChat:true};
it('deduplicates in-flight and completed IDs and uses existing new/continue methods',async()=>{
 let finish!:()=>void;const send=vi.fn(()=>new Promise<void>(r=>finish=r)),newChat=vi.fn(),reply=vi.fn();
 const c=createEmbedController({busy:()=>false,newChat,send});
 const run=c.receive(request,reply);await c.receive(request,reply);expect(send).toHaveBeenCalledTimes(1);expect(newChat).toHaveBeenCalledTimes(1);
 await c.receive({...request,requestId:'busy'},reply);expect(reply.mock.lastCall?.[0].type).toBe('fliggy:error');
 finish();await run;await c.receive(request,reply);expect(send).toHaveBeenCalledTimes(1);expect(reply.mock.lastCall?.[0].type).toBe('fliggy:completed');
 const next=c.receive({...request,requestId:'two',newChat:false},reply);finish();await next;expect(newChat).toHaveBeenCalledTimes(1);expect(send).toHaveBeenCalledTimes(2);
});
it('reports errors, deduplicates failed IDs, permits retry with fresh ID',async()=>{
 const send=vi.fn().mockRejectedValueOnce(Error('provider failed')).mockResolvedValue(undefined),reply=vi.fn();const c=createEmbedController({busy:()=>false,newChat:()=>{},send});
 await c.receive(request,reply);expect(reply.mock.lastCall?.[0]).toMatchObject({type:'fliggy:error',requestId:'one'});
 await c.receive(request,reply);expect(send).toHaveBeenCalledTimes(1);
 await c.receive({...request,requestId:'retry'},reply);expect(reply.mock.lastCall?.[0].type).toBe('fliggy:completed');
});
it('rejects while existing chat is generating or loading',async()=>{const send=vi.fn(),reply=vi.fn();const c=createEmbedController({busy:()=>true,newChat:()=>{},send});await c.receive(request,reply);expect(send).not.toHaveBeenCalled();expect(reply.mock.lastCall?.[0].type).toBe('fliggy:error')});
