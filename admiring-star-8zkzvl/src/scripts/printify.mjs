// scripts/printify.js
import 'dotenv/config';
import fetch from 'node-fetch';

const STORE_ID   = process.env.PRINTIFY_STORE_ID;
const API_TOKEN  = process.env.PRINTIFY_API_TOKEN;
const API_BASE   = 'https://api.printify.com/v1';

/**
 * Helper to call Printify API
 */
async function printifyRequest(path, method = 'GET', body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    console.error(await res.text());
    throw new Error(`Printify API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Create a new Printify product.
 */
async function createProduct({ title, blueprintId, variantIds, imagePath }) {
  const payload = {
    title,
    blueprint_id: blueprintId,
    print_areas: [
      {
        variant_ids: variantIds,
        images: [{ src: imagePath }]
      }
    ]
  };

  const product = await printifyRequest(`/shops/${STORE_ID}/products.json`, 'POST', payload);
  console.log(`✔ Created "${title}" →`, product.id);
  return product;
}

(async () => {
  const items = [
    { title: 'Undated Weekly Planner',        blueprintId: 800, variantIds:[1001], imagePath:'/assets/merch/planner-weekly.jpg' },
    { title: 'Budget Notebook',               blueprintId: 801, variantIds:[1002], imagePath:'/assets/merch/budget-notebook.jpg' },
    { title: 'Leather-Bound Deluxe Planner',  blueprintId: 802, variantIds:[1003], imagePath:'/assets/merch/planner-deluxe.jpg' },
    { title: 'Wedding Day Timeline Planner',   blueprintId: 803, variantIds:[1004], imagePath:'/assets/merch/wedding-timeline.jpg' },
    { title: 'Financial Goal Tracker',         blueprintId: 804, variantIds:[1005], imagePath:'/assets/merch/goal-tracker.jpg' },
    { title: '90-Day Goal-Setting Workbook',   blueprintId: 805, variantIds:[1006], imagePath:'/assets/merch/90day-workbook.jpg' },
    { title: 'Sticker Pack (20 pcs)',          blueprintId: 806, variantIds:[1007], imagePath:'/assets/merch/stickers.jpg' },
    { title: 'Premium Gel Pen Set (6-pack)',   blueprintId: 807, variantIds:[1008], imagePath:'/assets/merch/gel-pens.jpg' },
    { title: 'Ceramic Mug',                    blueprintId: 113, variantIds:[401],  imagePath:'/assets/merch/ceramic-mug.jpg' },
    { title: 'Insulated Tumbler',              blueprintId: 114, variantIds:[402],  imagePath:'/assets/merch/tumbler.jpg' },
    { title: 'Canvas Tote Bag',                blueprintId: 115, variantIds:[403],  imagePath:'/assets/merch/tote.jpg' },
    { title: 'Branded Water Bottle',           blueprintId: 116, variantIds:[404],  imagePath:'/assets/merch/bottle.jpg' },
    { title: 'Custom Scented Candle',          blueprintId: 117, variantIds:[405],  imagePath:'/assets/merch/candle.jpg' },
    { title: 'Gold-Foil Logo Throw Pillow',    blueprintId: 118, variantIds:[406],  imagePath:'/assets/merch/pillow.jpg' },
    { title: 'Heirloom Photo Album',           blueprintId: 119, variantIds:[407],  imagePath:'/assets/merch/photo-album.jpg' },
    { title: 'Milestone Cards (20 pcs)',       blueprintId: 120, variantIds:[408],  imagePath:'/assets/merch/milestone-cards.jpg' },
    { title: '2025 Desk Calendar',             blueprintId: 121, variantIds:[409],  imagePath:'/assets/merch/desk-calendar.jpg' },
    { title: 'Logo Mouse Pad',                 blueprintId: 122, variantIds:[410],  imagePath:'/assets/merch/mouse-pad.jpg' },
    { title: 'Phone Grip / PopSocket',         blueprintId: 123, variantIds:[411],  imagePath:'/assets/merch/popsocket.jpg' },
    { title: 'Enamel Logo Pin',                blueprintId: 124, variantIds:[412],  imagePath:'/assets/merch/enamel-pin.jpg' },
    { title: 'Enamel Keychain',                blueprintId: 125, variantIds:[413],  imagePath:'/assets/merch/keychain.jpg' },
    { title: 'Plush Branded Blanket',          blueprintId: 126, variantIds:[414],  imagePath:'/assets/merch/blanket.jpg' },
    // + 18 more creative items:
    { title: 'Branded Notebook Set',           blueprintId: 127, variantIds:[415],  imagePath:'/assets/merch/notebook-set.jpg' },
    { title: 'Executive Pen & Pencil Duo',     blueprintId: 128, variantIds:[416],  imagePath:'/assets/merch/pen-pencil.jpg' },
    { title: 'Leather Journal',                blueprintId: 129, variantIds:[417],  imagePath:'/assets/merch/journal.jpg' },
    { title: 'Canvas Laptop Sleeve',           blueprintId: 130, variantIds:[418],  imagePath:'/assets/merch/laptop-sleeve.jpg' },
    { title: 'Wireless Charger Pad',           blueprintId: 131, variantIds:[419],  imagePath:'/assets/merch/charger-pad.jpg' },
    { title: 'Branded Coaster Set',            blueprintId: 132, variantIds:[420],  imagePath:'/assets/merch/coasters.jpg' },
    { title: 'Travel Coffee Press',            blueprintId: 133, variantIds:[421],  imagePath:'/assets/merch/coffee-press.jpg' },
    { title: 'Branded Umbrella',               blueprintId: 134, variantIds:[422],  imagePath:'/assets/merch/umbrella.jpg' },
    { title: 'Embroidered Baseball Cap',       blueprintId: 135, variantIds:[423],  imagePath:'/assets/merch/cap.jpg' },
    { title: 'Crewneck Sweatshirt',            blueprintId: 136, variantIds:[424],  imagePath:'/assets/merch/sweatshirt.jpg' },
    { title: 'Classic T-shirt',                blueprintId: 137, variantIds:[425],  imagePath:'/assets/merch/tshirt.jpg' },
    { title: 'Phone Case (iPhone)',            blueprintId: 138, variantIds:[426],  imagePath:'/assets/merch/phone-case.jpg' },
    { title: 'Sticker Sheet (50 pcs)',         blueprintId: 806, variantIds:[427],  imagePath:'/assets/merch/stickers2.jpg' },
    { title: 'Mini Notepad Set',               blueprintId: 127, variantIds:[428],  imagePath:'/assets/merch/notepads.jpg' },
    { title: 'Branded Key Fob',                blueprintId: 125, variantIds:[429],  imagePath:'/assets/merch/key-fob.jpg' },
    { title: 'Logo Socks (2-pack)',            blueprintId: 139, variantIds:[430],  imagePath:'/assets/merch/socks.jpg' },
    { title: 'Branded Watercolor Print',       blueprintId: 140, variantIds:[431],  imagePath:'/assets/merch/art-print.jpg' },
    { title: 'Travel Tote Duffel',             blueprintId: 130, variantIds:[432],  imagePath:'/assets/merch/duffel.jpg' },
    { title: 'Enamel Lapel Pin Set',           blueprintId: 124, variantIds:[433],  imagePath:'/assets/merch/lapel-pins.jpg' },
    { title: 'Branded Notebook Cover',         blueprintId: 129, variantIds:[434],  imagePath:'/assets/merch/notebook-cover.jpg' },
    { title: 'Leather Bookmark',               blueprintId: 129, variantIds:[435],  imagePath:'/assets/merch/bookmark.jpg' },
    { title: 'Portable Bluetooth Speaker',     blueprintId: 141, variantIds:[436],  imagePath:'/assets/merch/speaker.jpg' },
    { title: 'Custom Mouse Pad XL',            blueprintId: 122, variantIds:[437],  imagePath:'/assets/merch/mouse-pad-xl.jpg' },
  ];

  for (const item of items) {
    try {
      await createProduct(item);
    } catch (err) {
      console.error(`✖ Failed "${item.title}"`, err.message);
    }
  }

  console.log('🎉 All createProduct calls complete!');
})();
