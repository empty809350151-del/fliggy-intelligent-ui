import {describe,it,expect} from 'vitest';
import {validSend,trustedParent} from './embed-protocol';
describe('embed protocol',()=>{
 it('requires exact parent source and allowlisted origin',()=>{const parent={};expect(trustedParent('http://127.0.0.1:8767',parent,parent,['http://127.0.0.1:8767'])).toBe(true);expect(trustedParent('http://evil.test',parent,parent,['http://127.0.0.1:8767'])).toBe(false);expect(trustedParent('http://127.0.0.1:8767',{},parent,['http://127.0.0.1:8767'])).toBe(false);expect(trustedParent('null',parent,parent,[])).toBe(false)});
 it('validates both conversation modes and rejects malformed input',()=>{const req={type:'fliggy:send',requestId:'test-1',text:'hello',newChat:true};expect(validSend(req)).toBe(true);expect(validSend({...req,newChat:false})).toBe(true);for(const data of [null,{}, {...req,text:''},{...req,text:'a'.repeat(5001)},{...req,newChat:'true'},{...req,requestId:''}])expect(validSend(data)).toBe(false)});
});
