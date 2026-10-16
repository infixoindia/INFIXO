/** Stable ID reorder: original image URLs, crop and upload metadata stay intact. */
export function moveWorkPhoto(items,fromId,toId) {
  if(!Array.isArray(items)||!fromId||!toId||fromId===toId)return items;
  const from=items.findIndex(x=>x.id===fromId),to=items.findIndex(x=>x.id===toId);
  if(from<0||to<0)return items;
  const next=[...items], [picked]=next.splice(from,1);
  next.splice(to,0,picked);
  return next;
}
