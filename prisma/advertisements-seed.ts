import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedAdvertisements() {
  console.log('🎯 Seeding advertisements...')

  // Find an admin user to associate with advertisements
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!adminUser) {
    console.log('⚠️ No admin user found. Skipping advertisement seeding.')
    return
  }

  const sampleAds = [
    {
      company: 'TechZone Electronics',
      headline: 'Mega Electronics Sale - 50% Off',
      description: 'Latest smartphones, laptops, and gadgets at unbeatable prices. Limited time offer!',
      ctaText: 'Shop Now',
      ctaUrl: 'https://example.com/electronics-sale',
      backgroundImage: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
      backgroundColor: 'from-blue-600 to-purple-600',
      priority: 'HIGH' as const,
      budget: 2500.00,
      isActive: true
    },
    {
      company: 'SecureAuto Insurance',
      headline: 'Premium Car Insurance from $299/year',
      description: 'Comprehensive coverage with 24/7 support. Get instant quote online.',
      ctaText: 'Get Quote',
      ctaUrl: 'https://example.com/car-insurance',
      backgroundImage: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
      backgroundColor: 'from-green-500 to-teal-600',
      priority: 'MEDIUM' as const,
      budget: 1800.00,
      isActive: true
    },
    {
      company: 'HomeCraft Renovations',
      headline: 'Transform Your Home Today',
      description: 'Professional renovation services. Kitchen, bathroom, and full home makeovers.',
      ctaText: 'Free Estimate',
      ctaUrl: 'https://example.com/home-renovation',
      backgroundImage: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      backgroundColor: 'from-orange-500 to-red-500',
      priority: 'MEDIUM' as const,
      budget: 1200.00,
      isActive: true
    },
    {
      company: 'StyleHub Fashion',
      headline: 'Designer Brands - Up to 70% Off',
      description: 'End-of-season clearance on premium fashion. International brands available.',
      ctaText: 'Shop Sale',
      ctaUrl: 'https://example.com/fashion-sale',
      backgroundImage: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
      backgroundColor: 'from-pink-500 to-purple-600',
      priority: 'LOW' as const,
      budget: 800.00,
      isActive: true
    },
    {
      company: 'ProShots Photography',
      headline: 'Professional Photography Services',
      description: 'Weddings, events, portraits. Capture your special moments with expert photographers.',
      ctaText: 'Book Session',
      ctaUrl: 'https://example.com/photography',
      backgroundImage: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
      backgroundColor: 'from-gray-600 to-gray-800',
      priority: 'LOW' as const,
      budget: 600.00,
      isActive: true
    }
  ]

  // First, check if we already have advertisements
  const existingAds = await prisma.advertisement.count()
  
  if (existingAds > 0) {
    console.log('✅ Advertisements already exist. Skipping seeding.')
    return
  }

  for (const adData of sampleAds) {
    await prisma.advertisement.create({
      data: {
        ...adData,
        createdByUserId: adminUser.id
      }
    })
  }

  console.log('✅ Advertisement seeding completed!')
}

// Only run if this file is executed directly
if (require.main === module) {
  seedAdvertisements()
    .catch((e) => {
      console.error('❌ Advertisement seeding failed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}