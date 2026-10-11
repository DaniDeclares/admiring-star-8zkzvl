// Design definitions: slogan -> icon composition. Slogans come from data/product-production/inventory.json (single source).
import fs from 'node:fs';
const inv = JSON.parse(fs.readFileSync(new URL('../../data/product-production/inventory.json', import.meta.url)));
export const PALETTES = {
  HALLOWEEN: { ink:'#1F1A1A', a1:'#E26E14', a2:'#6F4F82', a3:'#F2B544', cream:'#F7EBD0', ribbon:'#E26E14', ribbonText:'#1F1A1A', bg:'#F7EBD0', edition:'HALLOWEEN EDITION' },
  FALL:      { ink:'#43291A', a1:'#B4532A', a2:'#8E9B6C', a3:'#D39B45', cream:'#F6ECD8', ribbon:'#8E9B6C', ribbonText:'#2E2A1A', bg:'#F6ECD8', edition:'FALL EDITION' },
  CHRISTMAS: { ink:'#2A1F1C', a1:'#A3262A', a2:'#2F5D3A', a3:'#CDA64B', cream:'#F7EEDB', ribbon:'#A3262A', ribbonText:'#F7EEDB', bg:'#F7EEDB', edition:'HOLIDAY EDITION' },
};
const MAIN = { 'Notary / Signing Agent':'stamp', 'Cleaning':'broom', 'Real Estate':'house', 'Entrepreneurs / Admin':'mug', 'Small Business / Admin':'envelope', 'Delivery / Mobile Providers':'van', 'Courier / Delivery':'van' };
const SIDE = { HALLOWEEN:['ghost','pumpkin'], FALL:['leaf','pumpkin'], CHRISTMAS:['ornament','candycane'] };
const OVERRIDE = {
  "Pumpkin Spice & Real Estate Advice": { main:'house', left:'pumpkin', right:'mug', deco:['leaf','sparkle'] },
  "Resting Notary Face": { main:'stamp', left:'ghost', right:'moon' },
  "Boo! It's Notarized!": { main:'stamp', left:'ghost', right:'bat' },
  "Witch Better Have My Signatures": { main:'stamp', left:'moon', right:'bat' },
  "No Tricks, Just Signatures": { main:'stamp', left:'pumpkin', right:'ghost' },
  "I Clean Up Your Nightmares": { main:'spray', left:'ghost', right:'moon' },
  "Too Ghoul for Dirty Floors": { main:'broom', left:'ghost', right:'pumpkin' },
  "Witch, Please. I Clean.": { main:'broom', left:'moon', right:'bat' },
  "Sweeping Away the Spooky": { main:'broom', left:'bat', right:'ghost' },
  "Selling Houses, Not Haunted Ones": { main:'house', left:'ghost', right:'moon' },
  "Your Boo-tiful New Home Awaits": { main:'house', left:'pumpkin', right:'key' },
  "Haunted by Pending Closings": { main:'house', left:'ghost', right:'key' },
  "The Only Thing Scary Is This Market": { main:'tag', left:'bat', right:'house' },
  "Pumpkins, Properties & Pending Contracts": { main:'house', left:'pumpkin', right:'key' },
  "Falling for New Listings": { main:'tag', left:'leaf', right:'house' },
  "Pumpkin Spice & Notary Stamps": { main:'stamp', left:'pumpkin', right:'mug' },
  "Fall Into a Perfect Signing": { main:'stamp', left:'leaf', right:'leaf' },
  "Fall Leaves & Fresh Cleans": { main:'broom', left:'leaf', right:'leaf' },
  "Sweater Weather, Sparkling Floors": { main:'spray', left:'leaf', right:'pumpkin' },
  "Booked, Blessed & Pumpkin Obsessed": { main:'pumpkin', left:'leaf', right:'mug' },
  "Fall Hustle, Winter Goals": { main:'mug', left:'leaf', right:'pumpkin' },
  "Special Delivery From the Other Side": { main:'box', left:'ghost', right:'moon' },
  "Boo Crew Express": { main:'van', left:'ghost', right:'bat' },
  "Santa's Favorite Notary": { main:'stamp', left:'santahat', right:'star' },
  "Merry Clean-Mas": { main:'broom', left:'santahat', right:'ornament' },
  "Sleighing Closings": { main:'house', left:'santahat', right:'key' },
  "Sleighing Deliveries": { main:'van', left:'santahat', right:'box' },
  "CEO of Holiday Chaos": { main:'mug', left:'santahat', right:'ornament' },
};
export function designs() {
  return inv.merch.map(m => {
    const o = OVERRIDE[m.slogan] || {};
    const side = SIDE[m.season];
    return { key:m.key, slogan:m.slogan, season:m.season, profession:m.profession, priority:m.priority,
      main:o.main||MAIN[m.profession], left:o.left||side[0], right:o.right||side[1], deco:o.deco||['sparkle','sparkle'] };
  });
}
