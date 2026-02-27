import { JSONFilePreset } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'hotel_dawat.json');

const defaultData = {
  tables: [],
  reservations: [],
  menu_items: [],
  offers: [],
  contacts: [],
  gallery: [],
  reviews: [],
};

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await JSONFilePreset(DB_PATH, defaultData);
  await seedDatabase(dbInstance);
  return dbInstance;
}

async function seedDatabase(db) {
  // Ensure new schemas exist on older persistent databases
  if (!db.data.gallery) db.data.gallery = [];
  if (!db.data.reviews) db.data.reviews = [];

  // Seed tables
  if (db.data.tables.length === 0) {
    db.data.tables = [
      { id: 1, name: 'Table 1', seats: 2, location: 'indoor', is_active: true },
      { id: 2, name: 'Table 2', seats: 2, location: 'indoor', is_active: true },
      { id: 3, name: 'Table 3', seats: 4, location: 'indoor', is_active: true },
      { id: 4, name: 'Table 4', seats: 4, location: 'indoor', is_active: true },
      { id: 5, name: 'Table 5', seats: 4, location: 'indoor', is_active: true },
      { id: 6, name: 'Table 6', seats: 6, location: 'indoor', is_active: true },
      { id: 7, name: 'Table 7', seats: 6, location: 'indoor', is_active: true },
      { id: 8, name: 'Table 8', seats: 8, location: 'indoor', is_active: true },
      { id: 9, name: 'Table 9', seats: 4, location: 'outdoor', is_active: true },
      { id: 10, name: 'Table 10', seats: 4, location: 'outdoor', is_active: true },
      { id: 11, name: 'Table 11', seats: 6, location: 'outdoor', is_active: true },
      { id: 12, name: 'Table 12', seats: 8, location: 'outdoor', is_active: true },
      { id: 13, name: 'VIP Suite 1', seats: 10, location: 'vip', is_active: true },
      { id: 14, name: 'VIP Suite 2', seats: 12, location: 'vip', is_active: true },
    ];
    await db.write();
  }

  // Seed menu
  if (db.data.menu_items.length === 0) {
    db.data.menu_items = [
      // Starters
      { id: 1, name: 'Dawat Special Seekh Kebab', description: 'Minced lamb & spice kebabs grilled to perfection', price: 320, category: 'starters', is_available: true, is_featured: true },
      { id: 2, name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes in tandoor with bell peppers', price: 280, category: 'starters', is_available: true, is_featured: true },
      { id: 3, name: 'Crispy Prawns', description: 'Tiger prawns with spiced batter, tamarind chutney', price: 380, category: 'starters', is_available: true, is_featured: false },
      { id: 4, name: 'Veg Shammi Kebab', description: 'Crispy lentil patties with mint & coriander', price: 220, category: 'starters', is_available: true, is_featured: false },
      { id: 5, name: 'Chicken Malai Tikka', description: 'Tender chicken marinated in cream & spices', price: 350, category: 'starters', is_available: true, is_featured: true },
      // Mains
      { id: 6, name: 'Dawat Signature Biryani', description: 'Slow-cooked dum biryani with saffron & whole spices', price: 520, category: 'mains', is_available: true, is_featured: true },
      { id: 7, name: 'Butter Chicken', description: 'Classic creamy tomato-based chicken curry', price: 420, category: 'mains', is_available: true, is_featured: true },
      { id: 8, name: 'Dal Makhani', description: '24-hour slow-cooked black lentils with cream & butter', price: 280, category: 'mains', is_available: true, is_featured: false },
      { id: 9, name: 'Mutton Rogan Josh', description: 'Aromatic Kashmiri mutton curry with whole spices', price: 580, category: 'mains', is_available: true, is_featured: true },
      { id: 10, name: 'Paneer Butter Masala', description: 'Rich tomato-cream curry with soft cottage cheese', price: 320, category: 'mains', is_available: true, is_featured: false },
      { id: 11, name: 'Prawn Masala', description: 'Spiced prawn curry with coastal flavours', price: 520, category: 'mains', is_available: true, is_featured: false },
      { id: 12, name: 'Hyderabadi Chicken Curry', description: 'Bold Hyderabadi-style chicken with tangy gravy', price: 440, category: 'mains', is_available: true, is_featured: false },
      // Breads
      { id: 13, name: 'Garlic Naan', description: 'Fluffy tandoor bread with garlic & coriander butter', price: 80, category: 'breads', is_available: true, is_featured: false },
      { id: 14, name: 'Stuffed Paratha', description: 'Whole-wheat bread stuffed with spiced potato or paneer', price: 120, category: 'breads', is_available: true, is_featured: false },
      { id: 15, name: 'Roomali Roti', description: 'Paper-thin handkerchief bread', price: 60, category: 'breads', is_available: true, is_featured: false },
      { id: 16, name: 'Laccha Paratha', description: 'Multi-layered flaky whole-wheat paratha', price: 90, category: 'breads', is_available: true, is_featured: false },
      // Desserts
      { id: 17, name: 'Gulab Jamun', description: 'Warm milk-solid dumplings in rose-flavoured sugar syrup', price: 150, category: 'desserts', is_available: true, is_featured: false },
      { id: 18, name: 'Dawat Firni', description: 'Chilled rice pudding with pistachio & rosewater', price: 180, category: 'desserts', is_available: true, is_featured: true },
      { id: 19, name: 'Gajar Ka Halwa', description: 'Slow-cooked carrot pudding with khoya & dry fruits', price: 200, category: 'desserts', is_available: true, is_featured: false },
      { id: 20, name: 'Kulfi Falooda', description: 'Traditional Indian ice cream with vermicelli & basil seeds', price: 220, category: 'desserts', is_available: true, is_featured: true },
      // Beverages
      { id: 21, name: 'Dawat Special Lassi', description: 'Thick creamy yoghurt drink — sweet or salted', price: 120, category: 'beverages', is_available: true, is_featured: true },
      { id: 22, name: 'Masala Chai', description: 'Aromatic spiced Indian tea', price: 80, category: 'beverages', is_available: true, is_featured: false },
      { id: 23, name: 'Fresh Watermelon Juice', description: 'Chilled fresh-pressed watermelon juice', price: 100, category: 'beverages', is_available: true, is_featured: false },
      { id: 24, name: 'Mango Lassi', description: 'Refreshing mango & yoghurt smoothie', price: 140, category: 'beverages', is_available: true, is_featured: false },
    ];

    // Assign default photos for a premium look
    db.data.menu_items.forEach(item => {
      if (!item.image_url) {
        if (item.category === 'starters') item.image_url = '/uploads/default_starter.png';
        else if (item.category === 'mains') item.image_url = '/uploads/default_main.png';
        else if (item.category === 'desserts') item.image_url = '/uploads/default_dessert.png';
        else item.image_url = '/uploads/default_main.png';
      }
    });

    await db.write();
  }

  // Seed offers
  if (db.data.offers.length === 0) {
    db.data.offers = [
      { id: 1, title: 'Family Biryani Feast', description: 'Dawat Signature Biryani + 4 Naans + Raita + Dessert for 4 people', original_price: 1200, offer_price: 849, badge: 'Family Deal', image_url: '', is_active: true, created_at: new Date().toISOString() },
      { id: 2, title: 'Weekend BBQ Platter', description: 'Assorted Kebabs (12 pcs) + Mint Chutney + Salad', original_price: 980, offer_price: 699, badge: 'Weekend Special', image_url: '', is_active: true, created_at: new Date().toISOString() },
    ];
    await db.write();
  }

  console.log('✅ Database ready');
}
