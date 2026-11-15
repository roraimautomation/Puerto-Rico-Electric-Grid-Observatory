import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertApproved,assertSameOrigin,bearerOrCookie} from '../lib/access.ts';
const member={user_id:'one',email:'one@example.com',role:'reader',status:'approved'};
test('anonymous and pending users cannot read',()=>{assert.throws(()=>assertApproved(null));assert.throws(()=>assertApproved({...member,status:'pending'}));});
test('reader can read but cannot write; suspended administrator is denied',()=>{assert.doesNotThrow(()=>assertApproved(member));assert.throws(()=>assertApproved(member,true));assert.throws(()=>assertApproved({...member,role:'admin',status:'suspended'},true,'aal2'));});
test('administrator write needs MFA; updater can only pass inventory check',()=>{assert.throws(()=>assertApproved({...member,role:'admin'},true));assert.doesNotThrow(()=>assertApproved({...member,role:'admin'},true,'aal2'));assert.doesNotThrow(()=>assertApproved({...member,role:'updater'},true));});
test('cookie requests require exact origin',()=>{assert.throws(()=>assertSameOrigin(new Request('https://site.example/api',{method:'POST'})));assert.throws(()=>assertSameOrigin(new Request('https://site.example/api',{method:'POST',headers:{Origin:'https://evil.example'}})));assert.doesNotThrow(()=>assertSameOrigin(new Request('https://site.example/api',{method:'POST',headers:{Origin:'https://site.example'}})));});
test('invalid authorization header never falls back to browser session',()=>{assert.equal(bearerOrCookie(new Request('https://site.example',{headers:{Cookie:'__Host-sur18_access=a.b.c',Authorization:'Basic invalid'}})),undefined);});
