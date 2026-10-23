import { confirmedSalesSave } from './salesSaveResult2026.js';
test('confirmed save requires matching unique row',()=>{expect(confirmedSalesSave([{id:'lead-A'}],'lead-A',null).ok).toBe(true)});
test('zero-row save fails closed',()=>{expect(confirmedSalesSave([],'lead-A',null).ok).toBe(false)});
test('wrong or duplicate row fails closed',()=>{expect(confirmedSalesSave([{id:'lead-B'}],'lead-A',null).ok).toBe(false);expect(confirmedSalesSave([{id:'lead-A'},{id:'lead-A'}],'lead-A',null).ok).toBe(false)});
test('authorization and request errors fail closed',()=>{expect(confirmedSalesSave(null,'lead-A',{message:'permission denied'}).ok).toBe(false);expect(confirmedSalesSave(null,'lead-A',{message:'network error'}).ok).toBe(false)});
