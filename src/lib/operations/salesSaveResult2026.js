export function confirmedSalesSave(updated, id, error) {
 if (error) return { ok:false, message:'Sales save failed: '+error.message };
 if (!Array.isArray(updated) || updated.length !== 1 || updated[0]?.id !== id) {
   return { ok:false, message:'Sales save did not confirm the intended lead. Your entries are still here.' };
 }
 return { ok:true };
}
