const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
const NUMBER_WORDS={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
function quantityNear(text,token){const m=text.match(new RegExp('(?:\\b(\\d+)\\b|\\b('+Object.keys(NUMBER_WORDS).join('|')+')\\b)?\\s*(?:\\w+\\s+){0,2}'+token+'s?\\b'));if(!m)return null;return Number(m[1]||NUMBER_WORDS[m[2]]||1);}
export function interpretDiscoveryText(rawText){
 const raw=String(rawText||'').trim(),text=normalize(raw),facts=[],signals=[],negatives=[];
 const add=(type,value,evidence,confidence=.9)=>facts.push({type,value,evidence,confidence});
 const concepts=[['bathroom','bathroom',/\b(bathroom|bath|restroom)s?\b/],['bedroom','bedroom',/\bbed(room)?s?\b/],['kitchen','kitchen',/\bkitchen\b/],['move_out','move out',/\b(move[- ]?out|moving out|deposit back|security deposit)\b/],['move_in','move in',/\b(move[- ]?in|moving in)\b/],['vacuum','vacuum',/\b(vacuum|vacuuming)\b/],['dust','dust',/\b(dust|dusting)\b/],['carpet','carpet',/\b(carpet|rug)s?\b/],['pet','pet condition',/\b(pet|dog|cat|urine|fur)\b/],['recurring','recurring maintenance',/\b(weekly|biweekly|bi-weekly|monthly|regularly|recurring|maintain|maintenance)\b/]];
 for(const [type,label,re] of concepts){if(re.test(text)){const q=['bathroom','bedroom'].includes(type)?quantityNear(text,type):null;add(type,q||true,label);signals.push(type);}}
 if(/\b(?:only|just)\s+(?:need|want)?\s*(?:the\s+)?bathrooms?\b/.test(text))negatives.push('scope_only_bathrooms');
 if(/\bdo not\b|\bdon't\b|\bno need\b/.test(text))negatives.push('negative_scope');
 const unresolved=[];if(signals.includes('move_out')&&!signals.includes('bedroom'))unresolved.push('bedroom_count');if(signals.includes('pet')&&!/\b(light|moderate|heavy|severe)\b/.test(text))unresolved.push('pet_condition_severity');
 return {rawText:raw,normalizedText:text,facts,signals:[...new Set(signals)],negatives,unresolved,version:'2026-09-slice1'};
}
