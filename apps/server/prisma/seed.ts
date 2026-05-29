import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ─── Category data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    name: 'Mobiles & Tablets',
    slug: 'mobiles-tablets',
    icon: '📱',
    order: 1,
    subcategories: [
      { name: 'Mobile Phones', slug: 'mobile-phones', icon: '📱', order: 1 },
      { name: 'Tablets', slug: 'tablets', icon: '📟', order: 2 },
      { name: 'Mobile Accessories', slug: 'mobile-accessories', icon: '🔌', order: 3 },
      { name: 'Smart Watches', slug: 'smart-watches', icon: '⌚', order: 4 },
    ],
  },
  {
    name: 'Electronics & Appliances',
    slug: 'electronics-appliances',
    icon: '💻',
    order: 2,
    subcategories: [
      { name: 'Laptops & Computers', slug: 'laptops-computers', icon: '💻', order: 1 },
      { name: 'TVs & Audio', slug: 'tvs-audio', icon: '📺', order: 2 },
      { name: 'Cameras & Lenses', slug: 'cameras-lenses', icon: '📷', order: 3 },
      { name: 'Refrigerators', slug: 'refrigerators', icon: '🧊', order: 4 },
      { name: 'Washing Machines', slug: 'washing-machines', icon: '🫧', order: 5 },
      { name: 'ACs', slug: 'air-conditioners', icon: '❄️', order: 6 },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: '🍳', order: 7 },
      { name: 'Games & Entertainment', slug: 'games-entertainment', icon: '🎮', order: 8 },
    ],
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    icon: '🚗',
    order: 3,
    subcategories: [
      { name: 'Cars', slug: 'cars', icon: '🚗', order: 1 },
      { name: 'Motorcycles', slug: 'motorcycles', icon: '🏍️', order: 2 },
      { name: 'Scooters', slug: 'scooters', icon: '🛵', order: 3 },
      { name: 'Bicycles', slug: 'bicycles', icon: '🚲', order: 4 },
      { name: 'Trucks & Buses', slug: 'trucks-buses', icon: '🚚', order: 5 },
      { name: 'Spare Parts', slug: 'spare-parts', icon: '⚙️', order: 6 },
    ],
  },
  {
    name: 'Property',
    slug: 'property',
    icon: '🏠',
    order: 4,
    subcategories: [
      { name: 'For Sale: Houses & Apartments', slug: 'sale-houses-apartments', icon: '🏡', order: 1 },
      { name: 'For Rent: Houses & Apartments', slug: 'rent-houses-apartments', icon: '🏢', order: 2 },
      { name: 'Lands & Plots', slug: 'lands-plots', icon: '🌍', order: 3 },
      { name: 'For Rent: Shops & Offices', slug: 'rent-shops-offices', icon: '🏪', order: 4 },
      { name: 'For Sale: Shops & Offices', slug: 'sale-shops-offices', icon: '🏬', order: 5 },
      { name: 'PG & Guest Houses', slug: 'pg-guest-houses', icon: '🛏️', order: 6 },
    ],
  },
  {
    name: 'Jobs',
    slug: 'jobs',
    icon: '💼',
    order: 5,
    subcategories: [
      { name: 'Data Entry & Back Office', slug: 'data-entry-back-office', icon: '🖥️', order: 1 },
      { name: 'Sales & Marketing', slug: 'sales-marketing', icon: '📈', order: 2 },
      { name: 'BPO & Telecaller', slug: 'bpo-telecaller', icon: '📞', order: 3 },
      { name: 'IT Engineer & Developer', slug: 'it-engineer-developer', icon: '👨‍💻', order: 4 },
      { name: 'Teacher', slug: 'teacher', icon: '📚', order: 5 },
      { name: 'Driver', slug: 'driver', icon: '🚙', order: 6 },
      { name: 'Delivery & Collection', slug: 'delivery-collection', icon: '📦', order: 7 },
      { name: 'Other Jobs', slug: 'other-jobs', icon: '💼', order: 8 },
    ],
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    icon: '🛋️',
    order: 6,
    subcategories: [
      { name: 'Sofa & Dining', slug: 'sofa-dining', icon: '🛋️', order: 1 },
      { name: 'Beds & Wardrobes', slug: 'beds-wardrobes', icon: '🛏️', order: 2 },
      { name: 'Home Decor & Garden', slug: 'home-decor-garden', icon: '🪴', order: 3 },
      { name: "Kids' Furniture", slug: 'kids-furniture', icon: '🪆', order: 4 },
      { name: 'Other Household Items', slug: 'other-household', icon: '🏠', order: 5 },
    ],
  },
  {
    name: 'Fashion & Beauty',
    slug: 'fashion-beauty',
    icon: '👗',
    order: 7,
    subcategories: [
      { name: "Men's Clothing", slug: 'mens-clothing', icon: '👔', order: 1 },
      { name: "Women's Clothing", slug: 'womens-clothing', icon: '👗', order: 2 },
      { name: "Kids' Clothing", slug: 'kids-clothing', icon: '👕', order: 3 },
      { name: "Men's Footwear", slug: 'mens-footwear', icon: '👟', order: 4 },
      { name: "Women's Footwear", slug: 'womens-footwear', icon: '👠', order: 5 },
      { name: 'Watches & Accessories', slug: 'watches-accessories', icon: '💍', order: 6 },
    ],
  },
  {
    name: 'Books, Sports & Hobbies',
    slug: 'books-sports-hobbies',
    icon: '📚',
    order: 8,
    subcategories: [
      { name: 'Books', slug: 'books', icon: '📚', order: 1 },
      { name: 'Gym & Fitness', slug: 'gym-fitness', icon: '🏋️', order: 2 },
      { name: 'Sports Equipment', slug: 'sports-equipment', icon: '⚽', order: 3 },
      { name: 'Musical Instruments', slug: 'musical-instruments', icon: '🎸', order: 4 },
      { name: 'Art & Collectibles', slug: 'art-collectibles', icon: '🎨', order: 5 },
    ],
  },
  {
    name: 'Pets',
    slug: 'pets',
    icon: '🐾',
    order: 9,
    subcategories: [
      { name: 'Dogs', slug: 'dogs', icon: '🐕', order: 1 },
      { name: 'Cats', slug: 'cats', icon: '🐈', order: 2 },
      { name: 'Birds', slug: 'birds', icon: '🦜', order: 3 },
      { name: 'Fish & Aquarium', slug: 'fish-aquarium', icon: '🐠', order: 4 },
      { name: 'Pet Accessories', slug: 'pet-accessories', icon: '🦴', order: 5 },
    ],
  },
  {
    name: 'Services',
    slug: 'services',
    icon: '🔧',
    order: 10,
    subcategories: [
      { name: 'Packers & Movers', slug: 'packers-movers', icon: '📦', order: 1 },
      { name: 'Electronics Repair', slug: 'electronics-repair', icon: '🔧', order: 2 },
      { name: 'Cleaning & Pest Control', slug: 'cleaning-pest-control', icon: '🧹', order: 3 },
      { name: 'Plumber & Electrician', slug: 'plumber-electrician', icon: '🪛', order: 4 },
      { name: 'Tutors & Classes', slug: 'tutors-classes', icon: '📖', order: 5 },
      { name: 'Other Services', slug: 'other-services', icon: '🛠️', order: 6 },
    ],
  },
];

// ─── Demo seller + sample ads ──────────────────────────────────────────────────

const DEMO_SELLER_EMAIL = 'demo.seller@olx.com';
const DEMO_SELLER_PASSWORD = 'Demo@1234';

const SAMPLE_ADS = [
  {
    categorySlug: 'mobiles-tablets',
    subcategorySlug: 'mobile-phones',
    title: 'iPhone 14 128GB - Midnight Black',
    description:
      'Purchased 8 months ago. Battery health 94%. Comes with original box, charger and cable. No scratches or dents. Selling due to upgrade.',
    price: 62000,
    condition: 'LIKE_NEW' as const,
    city: 'Mumbai',
    area: 'Bandra West',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'],
  },
  {
    categorySlug: 'mobiles-tablets',
    subcategorySlug: 'mobile-phones',
    title: 'Samsung Galaxy S23 Ultra 256GB',
    description:
      'Excellent condition. S Pen included. Screen protector and case always used. Minor wear on edges. One owner from new.',
    price: 75000,
    condition: 'GOOD' as const,
    city: 'Delhi',
    area: 'Lajpat Nagar',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
  },
  {
    categorySlug: 'mobiles-tablets',
    subcategorySlug: 'tablets',
    title: 'iPad Pro 11-inch M2 Wi-Fi 256GB',
    description:
      'Used for 6 months for drawing and note-taking. Apple Pencil 2nd gen included. No scratches. Original box and charger.',
    price: 72000,
    condition: 'LIKE_NEW' as const,
    city: 'Bangalore',
    area: 'Koramangala',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
  },
  {
    categorySlug: 'electronics-appliances',
    subcategorySlug: 'laptops-computers',
    title: 'MacBook Air M2 13-inch 8GB/256GB',
    description:
      'Bought last year. Barely used — emails and light work only. Battery cycles: 45. Comes with charger and original box.',
    price: 85000,
    condition: 'LIKE_NEW' as const,
    city: 'Bangalore',
    area: 'Koramangala',
    images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'],
  },
  {
    categorySlug: 'electronics-appliances',
    subcategorySlug: 'tvs-audio',
    title: 'Sony Bravia 55" 4K Smart TV',
    description:
      '2022 model, great working condition. Selling because shifting to smaller apartment. No dead pixels. All ports functional.',
    price: 45000,
    condition: 'GOOD' as const,
    city: 'Pune',
    area: 'Kothrud',
    images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800'],
  },
  {
    categorySlug: 'electronics-appliances',
    subcategorySlug: 'cameras-lenses',
    title: 'Sony Alpha A7 III Mirrorless Camera',
    description:
      'Body only. Shutter count: 12,000. Excellent condition. All accessories included. Upgrading to A7 IV, hence selling.',
    price: 145000,
    condition: 'GOOD' as const,
    city: 'Mumbai',
    area: 'Andheri West',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
  },
  {
    categorySlug: 'vehicles',
    subcategorySlug: 'cars',
    title: 'Honda City 2020 Petrol ZX CVT',
    description:
      '35,000 km driven. Single owner. Full service history at authorised service centre. Sunroof, lane watch, Honda Sensing. Minor parking scratches only.',
    price: 1050000,
    condition: 'GOOD' as const,
    city: 'Mumbai',
    area: 'Andheri East',
    images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800'],
  },
  {
    categorySlug: 'vehicles',
    subcategorySlug: 'motorcycles',
    title: 'Royal Enfield Classic 350 2021',
    description:
      '18,000 km. Well maintained. All accessories: saddlebags, crash guard, engine guard. Registration and insurance up to date.',
    price: 165000,
    condition: 'GOOD' as const,
    city: 'Delhi',
    area: 'Dwarka',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
  },
  {
    categorySlug: 'property',
    subcategorySlug: 'rent-houses-apartments',
    title: '2BHK Flat for Rent - Fully Furnished',
    description:
      'Spacious 2BHK in prime location. Fully furnished with AC, refrigerator, washing machine. 24/7 security, lift, parking. Close to metro.',
    price: 35000,
    condition: 'GOOD' as const,
    city: 'Bangalore',
    area: 'HSR Layout',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
  },
  {
    categorySlug: 'property',
    subcategorySlug: 'sale-houses-apartments',
    title: '3BHK Apartment for Sale - Ready to Move',
    description:
      '1,450 sq ft. East facing. Modular kitchen, 3 bathrooms. Club house, gym, swimming pool. Semi-furnished. Direct from owner, no brokerage.',
    price: 8500000,
    condition: 'NEW' as const,
    city: 'Hyderabad',
    area: 'Gachibowli',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
  },
  {
    categorySlug: 'furniture',
    subcategorySlug: 'sofa-dining',
    title: 'L-Shaped Sofa Set 6-Seater',
    description:
      'Premium fabric sofa, barely 1 year old. No stains or tears. Selling due to relocation. Self-pickup or can arrange transport.',
    price: 28000,
    condition: 'LIKE_NEW' as const,
    city: 'Mumbai',
    area: 'Powai',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
  },
  {
    categorySlug: 'furniture',
    subcategorySlug: 'beds-wardrobes',
    title: 'King Size Bed with Storage + Mattress',
    description:
      'Solid wood king size bed with hydraulic storage. Includes 6-inch memory foam mattress (2 years old). Disassembles easily for transport.',
    price: 22000,
    condition: 'GOOD' as const,
    city: 'Hyderabad',
    area: 'Gachibowli',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
  },
  {
    categorySlug: 'fashion-beauty',
    subcategorySlug: 'mens-clothing',
    title: 'Allen Solly Premium Blazer Navy Blue - Size 42',
    description:
      'Worn twice for interviews. Dry cleaned. Perfect condition. Original price ₹4,500. Selling at a steal.',
    price: 1200,
    condition: 'LIKE_NEW' as const,
    city: 'Chennai',
    area: 'Anna Nagar',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
  },
  {
    categorySlug: 'books-sports-hobbies',
    subcategorySlug: 'books',
    title: 'UPSC Preparation Books Complete Set (15 books)',
    description:
      'Complete set for UPSC preparation. NCERT class 6-12, Laxmikant, Bipin Chandra, M Laxmikant Polity and more. All in good condition.',
    price: 2500,
    condition: 'GOOD' as const,
    city: 'Delhi',
    area: 'Rajouri Garden',
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'],
  },
  {
    categorySlug: 'books-sports-hobbies',
    subcategorySlug: 'gym-fitness',
    title: 'Adjustable Dumbbell Set 5-40 kg',
    description:
      'Bowflex SelectTech adjustable dumbbells. Adjust from 5 to 40 kg in 2.5 kg increments. Like new. Selling because joining gym.',
    price: 18000,
    condition: 'LIKE_NEW' as const,
    city: 'Pune',
    area: 'Baner',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
  },
  {
    categorySlug: 'pets',
    subcategorySlug: 'dogs',
    title: 'Golden Retriever Puppies - 2 months old',
    description:
      'KCI registered Golden Retriever puppies. Parents health tested. Dewormed and vaccinated. Come with health certificate. Very friendly.',
    price: 25000,
    condition: 'NEW' as const,
    city: 'Bangalore',
    area: 'Whitefield',
    images: ['https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800'],
  },
  {
    categorySlug: 'pets',
    subcategorySlug: 'cats',
    title: 'Persian Kitten - 3 months old',
    description:
      'Pure white Persian kitten. Very playful and friendly. Vaccinated and dewormed. Comes with food bowl, litter box and toys.',
    price: 15000,
    condition: 'NEW' as const,
    city: 'Mumbai',
    area: 'Goregaon',
    images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'],
  },
  {
    categorySlug: 'services',
    subcategorySlug: 'packers-movers',
    title: 'Reliable Packers & Movers - Mumbai',
    description:
      'Professional packing and moving within Mumbai and outstation. 10+ years experience. Insured goods. Free site survey. Best rates guaranteed.',
    price: 5000,
    condition: 'NEW' as const,
    city: 'Mumbai',
    area: 'Borivali',
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'],
  },
  {
    categorySlug: 'jobs',
    subcategorySlug: 'it-engineer-developer',
    title: 'Full Stack Developer Needed - Work From Home',
    description:
      'Hiring React + Node.js developer for product startup. 2+ years experience. CTC: 8-12 LPA. Fully remote. Immediate joining preferred.',
    price: 900000,
    condition: 'NEW' as const,
    city: 'Bangalore',
    area: 'Remote',
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'],
  },
  {
    categorySlug: 'electronics-appliances',
    subcategorySlug: 'games-entertainment',
    title: 'PlayStation 5 Console + 2 Controllers',
    description:
      'PS5 Disc Edition, purchased 1 year ago. 2 DualSense controllers. 4 games included: FIFA 24, God of War, Spider-Man, Gran Turismo 7.',
    price: 48000,
    condition: 'GOOD' as const,
    city: 'Delhi',
    area: 'Saket',
    images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800'],
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. Categories & subcategories ──────────────────────────────────────────
  let categoryCount = 0;
  let subcategoryCount = 0;

  for (const cat of CATEGORIES) {
    const { subcategories, ...catData } = cat;

    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: { name: catData.name, icon: catData.icon, order: catData.order },
      create: catData,
    });

    categoryCount++;

    for (const sub of subcategories) {
      await prisma.subCategory.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, icon: sub.icon, order: sub.order, categoryId: category.id },
        create: { ...sub, categoryId: category.id },
      });
      subcategoryCount++;
    }

    console.log(`  ✅ ${category.name} (${subcategories.length} subcategories)`);
  }

  console.log(`\n  ${categoryCount} categories, ${subcategoryCount} subcategories seeded`);

  // ── 2. Demo seller user ────────────────────────────────────────────────────
  console.log('\n👤 Creating demo seller...');

  const hashedPassword = await bcrypt.hash(DEMO_SELLER_PASSWORD, 10);

  const seller = await prisma.user.upsert({
    where: { email: DEMO_SELLER_EMAIL },
    update: {},
    create: {
      email: DEMO_SELLER_EMAIL,
      password: hashedPassword,
      role: 'SELLER',
      isVerified: true,
    },
  });

  await prisma.profile.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      name: 'Demo Seller',
      city: 'Mumbai',
      bio: 'Demo account with sample listings across all categories.',
    },
  });

  console.log(`  ✅ Demo seller: ${DEMO_SELLER_EMAIL} (password: ${DEMO_SELLER_PASSWORD})`);

  // ── 3. Sample ads ──────────────────────────────────────────────────────────
  console.log('\n📦 Creating sample ads...');

  let adsCreated = 0;
  let adsSkipped = 0;

  for (const ad of SAMPLE_ADS) {
    // Skip if ad already exists (idempotent re-runs)
    const existing = await prisma.sellerAd.findFirst({
      where: { userId: seller.id, title: ad.title },
    });
    if (existing) {
      adsSkipped++;
      continue;
    }

    const category = await prisma.category.findUnique({ where: { slug: ad.categorySlug } });
    if (!category) {
      console.warn(`  ⚠️  Category not found: ${ad.categorySlug}`);
      continue;
    }

    const subcategory = ad.subcategorySlug
      ? await prisma.subCategory.findUnique({ where: { slug: ad.subcategorySlug } })
      : null;

    const product = await prisma.product.create({
      data: {
        name: ad.title,
        description: ad.description,
        categoryId: category.id,
        subcategoryId: subcategory?.id ?? null,
      },
    });

    await prisma.sellerAd.create({
      data: {
        title: ad.title,
        description: ad.description,
        price: ad.price,
        condition: ad.condition,
        city: ad.city,
        area: ad.area ?? null,
        userId: seller.id,
        productId: product.id,
        status: 'ACTIVE',
        images: {
          create: ad.images.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        },
      },
    });

    console.log(`  ✅ [${ad.categorySlug}] ${ad.title}`);
    adsCreated++;
  }

  if (adsSkipped > 0) console.log(`  ⏭️  ${adsSkipped} ads already exist, skipped`);

  console.log(`\n✨ Done!`);
  console.log(`   ${categoryCount} categories`);
  console.log(`   ${subcategoryCount} subcategories`);
  console.log(`   ${adsCreated} sample ads created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
