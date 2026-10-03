import {describe,expect,it} from 'vitest';
import {getServiceVisuals} from './serviceVisuals2026.js';

describe('service visual routing',()=>{
 it('routes representative services to distinct service-specific visuals',()=>{
  const bathroom=getServiceVisuals('01','Bathroom Detail & Sanitization','bathroom-detail')[0];
  const laundry=getServiceVisuals('01','Wash Dry Fold','laundry')[0];
  const pet=getServiceVisuals('01','Dog Walking','dog-walking')[0];
  expect(bathroom?.imageUrl).toBeTruthy();
  expect(laundry?.imageUrl).toBeTruthy();
  expect(pet?.imageUrl).toBeTruthy();
  expect(new Set([bathroom.imageUrl,laundry.imageUrl,pet.imageUrl]).size).toBe(3);
 });

 it('keeps unknown services on the governed division fallback instead of inventing media',()=>{
  const fallback=getServiceVisuals('04','Unmapped Governed Service','unmapped')[0];
  expect(fallback?.imageUrl).toBeTruthy();
  expect(fallback?.sourceType).toMatch(/^(STOCK|BRANDED)$/);
 });
});
