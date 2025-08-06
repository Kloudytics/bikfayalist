import { PrismaClient, Role, ListingStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal database seeding for production...')
  
  // Hash the demo password properly for all users
  const hashedPassword = await hash("B@troun007", 12)
  console.log('🔐 Demo password hashed for secure authentication')

  // Create essential categories for Lebanon market
  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Vehicles', slug: 'vehicles' },
    { name: 'Real Estate', slug: 'real-estate' },
    { name: 'Jobs', slug: 'jobs' },
    { name: 'Services', slug: 'services' },
    { name: 'Fashion & Beauty', slug: 'fashion' },
    { name: 'Home & Garden', slug: 'home-garden' },
    { name: 'Sports & Recreation', slug: 'sports' },
    { name: 'Books & Education', slug: 'books' },
    { name: 'Others', slug: 'others' },
  ]

  console.log('📂 Creating categories...')
  const createdCategories: { [key: string]: any } = {}
  
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories[category.slug] = created
  }

  // Create minimal essential users for testing
  console.log('👥 Creating essential users...')
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bikfayalist.com' },
    update: {},
    create: {
      email: 'admin@bikfayalist.com',
      name: 'BikfayaList Admin',
      password: hashedPassword,
      role: Role.ADMIN,
      bio: 'Platform administrator for BikfayaList',
      location: 'Bikfaya, Lebanon',
      phone: '+961 4 987-654',
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'demo@bikfayalist.com' },
    update: {},
    create: {
      email: 'demo@bikfayalist.com',
      name: 'Demo User',
      password: hashedPassword,
      role: Role.USER,
      bio: 'Demo account for testing BikfayaList',
      location: 'Mazraat Yachou, Lebanon',
      phone: '+961 4 123-456',
    },
  })

  // Create one sample listing for testing
  console.log('📝 Creating sample listing...')
  
  // Check if sample listing already exists
  const existingListing = await prisma.listing.findFirst({
    where: { 
      title: 'Welcome to BikfayaList - Sample Listing',
      userId: testUser.id
    }
  })
  
  if (!existingListing) {
    await prisma.listing.create({
      data: {
        title: 'Welcome to BikfayaList - Sample Listing',
        description: 'This is a sample listing to demonstrate BikfayaList functionality. This platform connects the Bikfaya community for buying, selling, and trading items locally. Feel free to delete this listing once you start adding your own!',
        price: 25.00,
        location: 'Bikfaya, Mount Lebanon, Lebanon',
        categoryId: createdCategories['others'].id,
        userId: testUser.id,
        status: ListingStatus.ACTIVE,
        images: '[]', // No images for sample listing
        views: 5,
        featured: false,
      },
    })
    console.log('✅ Sample listing created')
  } else {
    console.log('ℹ️ Sample listing already exists, skipping...')
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('🎯 Production-ready seed data created:')
  console.log('   📂 10 Essential categories')
  console.log('   👤 2 Users (1 admin + 1 demo user)')  
  console.log('   📝 1 Sample listing')
  console.log('')
  console.log('🔑 Demo login credentials:')
  console.log('   Email: admin@bikfayalist.com')
  console.log('   Email: demo@bikfayalist.com') 
  console.log('   Password: B@troun007')
  console.log('')
  console.log('🚀 Ready for production deployment!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })