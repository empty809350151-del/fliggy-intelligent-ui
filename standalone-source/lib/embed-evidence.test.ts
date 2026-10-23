import {describe,it,expect} from 'vitest';
import {library} from './library';
import {inspectOutput} from './embed-evidence';
describe('output evidence',()=>{
 it('recognizes reachable components, not component names in prose or orphaned nodes',()=>{
  const r=inspectOutput('unused = Button("unused")\nroot = Col([Text("Slider Price TravelModule"), Card([Text("hello")])])',library);
  expect(r.valid).toBe(true);expect(r.components.map(c=>c.name)).toContain('Card');
  expect(r.components.map(c=>c.name)).not.toContain('Slider');expect(r.components.map(c=>c.name)).not.toContain('Button');
  expect(r.interactionVerified).toBe(false);
 });
 it('retains reachable components when a child-array schema error is recoverable',()=>{
  const r=inspectOutput('root = Card(Col([Text("hello")]))',library);
  expect(r.valid).toBe(false);expect(r.issues.length).toBeGreaterThan(0);
  expect(r.components.map(c=>c.name)).toContain('Col');
  expect(r.components.map(c=>c.name)).toContain('Text');
 });
 it('does not report invalid programs as implemented assets',()=>{
  const r=inspectOutput('root = NotARealComponent("x")',library);
  expect(r.valid).toBe(false);expect(r.components).toEqual([]);
 });
});
