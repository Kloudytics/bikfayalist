import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Vehicles', slug: 'vehicles' },
    { name: 'Real Estate', slug: 'real-estate' },
    { name: 'Jobs', slug: 'jobs' },
    { name: 'Services', slug: 'services' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Garden', slug: 'home-garden' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Books', slug: 'books' },
    { name: 'Pets', slug: 'pets' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  // Create sample users
  const users = [
    {
      email: 'admin@bikfayalist.com',
      name: 'Admin User',
      role: 'ADMIN',
      bio: 'Platform administrator',
      location: 'New York, NY',
    },
    {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'USER',
      bio: 'Tech enthusiast and collector',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
    },
    {
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'USER',
      bio: 'Fashion lover and entrepreneur',
      location: 'Los Angeles, CA',
      phone: '+1 (555) 987-6543',
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  // Get created categories and users
  const electronicsCategory = await prisma.category.findUnique({ where: { slug: 'electronics' } })
  const vehiclesCategory = await prisma.category.findUnique({ where: { slug: 'vehicles' } })
  const fashionCategory = await prisma.category.findUnique({ where: { slug: 'fashion' } })
  const homeCategory = await prisma.category.findUnique({ where: { slug: 'home-garden' } })
  
  const johnUser = await prisma.user.findUnique({ where: { email: 'john@example.com' } })
  const janeUser = await prisma.user.findUnique({ where: { email: 'jane@example.com' } })

  // Create sample listings
  const listings = [
    {
      title: 'iPhone 14 Pro Max - Excellent Condition',
      description: 'Barely used iPhone 14 Pro Max in Deep Purple. Includes original box, charger, and screen protector. No scratches or damage. Perfect for someone looking for a premium smartphone at a great price.',
      price: 899,
      location: 'San Francisco, CA',
      images: JSON.stringify([
        'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
        'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'
      ]),
      categoryId: electronicsCategory?.id,
      userId: johnUser?.id,
      featured: true,
      views: 156,
    },
    {
      title: '2018 Honda Civic - Low Mileage',
      description: 'Well-maintained 2018 Honda Civic with only 45,000 miles. Regular oil changes, non-smoker, garage kept. Great fuel economy and reliable transportation. Clean title, ready for new owner.',
      price: 18500,
      location: 'Los Angeles, CA',
      images: JSON.stringify([
        'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
        'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg'
      ]),
      categoryId: vehiclesCategory?.id,
      userId: janeUser?.id,
      views: 89,
    },
    {
      title: 'Designer Handbag Collection',
      description: 'Authentic designer handbags from various luxury brands. All items are genuine with certificates of authenticity. Perfect condition, stored in dust bags. Great investment pieces or personal collection additions.',
      price: 1200,
      location: 'New York, NY',
      images: JSON.stringify([
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
        'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg'
      ]),
      categoryId: fashionCategory?.id,
      userId: janeUser?.id,
      featured: true,
      views: 234,
    },
    {
      title: 'Vintage Mid-Century Dining Set',
      description: 'Beautiful vintage mid-century modern dining set including table and 6 chairs. Solid wood construction, recently refinished. Perfect for modern homes with vintage flair. Some minor wear consistent with age.',
      price: 850,
      location: 'Portland, OR',
      images: JSON.stringify([
        'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
      ]),
      categoryId: homeCategory?.id,
      userId: johnUser?.id,
      views: 67,
    },
    {
      title: 'MacBook Pro 16" M1 Max',
      description: 'Top-of-the-line MacBook Pro with M1 Max chip, 32GB RAM, 1TB SSD. Perfect for video editing, development, and creative work. Excellent condition with minimal signs of use. Includes original charger and box.',
      price: 2800,
      location: 'Austin, TX',
      images: JSON.stringify([
        'https://images.pexels.com/photos/18105/pexels-photo.jpg',
        'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg'
      ]),
      categoryId: electronicsCategory?.id,
      userId: johnUser?.id,
      featured: true,
      views: 312,
    },
    {
      title: 'Professional Camera Equipment Bundle',
      description: 'Complete photography setup including Canon EOS R5, multiple lenses (24-70mm, 70-200mm), tripod, lighting equipment, and camera bag. Perfect for professional photographers or serious enthusiasts.',
      price: 4500,
      location: 'Miami, FL',
      images: JSON.stringify([
        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
        'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'
      ]),
      categoryId: electronicsCategory?.id,
      userId: janeUser?.id,
      views: 145,
    },
  ]

  for (const listing of listings) {
    if (listing.categoryId && listing.userId) {
      await prisma.listing.create({
        data: listing,
      })
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })