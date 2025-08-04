import { PrismaClient, Role } from '@prisma/client'

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
      role: Role.ADMIN,
      bio: 'Platform administrator',
      location: 'New York, NY',
    },
    {
      email: 'john@example.com',
      name: 'John Doe',
      role: Role.USER,
      bio: 'Tech enthusiast and collector',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
    },
    {
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: Role.USER,
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

  // Get additional categories
  const realEstateCategory = await prisma.category.findUnique({ where: { slug: 'real-estate' } })
  const jobsCategory = await prisma.category.findUnique({ where: { slug: 'jobs' } })
  const servicesCategory = await prisma.category.findUnique({ where: { slug: 'services' } })
  const sportsCategory = await prisma.category.findUnique({ where: { slug: 'sports' } })
  const booksCategory = await prisma.category.findUnique({ where: { slug: 'books' } })
  const petsCategory = await prisma.category.findUnique({ where: { slug: 'pets' } })

  // Create sample listings - 30 diverse listings for pagination testing
  const listings = [
    {
      title: 'iPhone 14 Pro Max - Excellent Condition',
      description: 'Barely used iPhone 14 Pro Max in Deep Purple. Includes original box, charger, and screen protector. No scratches or damage. Perfect for someone looking for a premium smartphone at a great price.',
      price: 899,
      location: 'San Francisco, CA',
      images: JSON.stringify(['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg']),
      categoryId: electronicsCategory?.id,
      userId: johnUser?.id,
      featured: true,
      views: 156,
    },
    {
      title: '2018 Honda Civic - Low Mileage',
      description: 'Well-maintained 2018 Honda Civic with only 45,000 miles. Regular oil changes, non-smoker, garage kept. Great fuel economy and reliable transportation.',
      price: 18500,
      location: 'Los Angeles, CA',
      images: JSON.stringify(['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg']),
      categoryId: vehiclesCategory?.id,
      userId: janeUser?.id,
      views: 89,
    },
    {
      title: 'Designer Handbag Collection',
      description: 'Authentic designer handbags from various luxury brands. All items are genuine with certificates of authenticity. Perfect condition, stored in dust bags.',
      price: 1200,
      location: 'New York, NY',
      images: JSON.stringify(['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg']),
      categoryId: fashionCategory?.id,
      userId: janeUser?.id,
      featured: true,
      views: 234,
    },
    {
      title: 'Vintage Mid-Century Dining Set',
      description: 'Beautiful vintage mid-century modern dining set including table and 6 chairs. Solid wood construction, recently refinished. Perfect for modern homes with vintage flair.',
      price: 850,
      location: 'Portland, OR',
      images: JSON.stringify(['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg']),
      categoryId: homeCategory?.id,
      userId: johnUser?.id,
      views: 67,
    },
    {
      title: 'MacBook Pro 16" M1 Max',
      description: 'Top-of-the-line MacBook Pro with M1 Max chip, 32GB RAM, 1TB SSD. Perfect for video editing, development, and creative work. Excellent condition with minimal signs of use.',
      price: 2800,
      location: 'Austin, TX',
      images: JSON.stringify(['https://images.pexels.com/photos/18105/pexels-photo.jpg']),
      categoryId: electronicsCategory?.id,
      userId: johnUser?.id,
      featured: true,
      views: 312,
    },
    {
      title: 'Professional Camera Equipment Bundle',
      description: 'Complete photography setup including Canon EOS R5, multiple lenses, tripod, lighting equipment, and camera bag. Perfect for professional photographers.',
      price: 4500,
      location: 'Miami, FL',
      images: JSON.stringify(['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg']),
      categoryId: electronicsCategory?.id,
      userId: janeUser?.id,
      views: 145,
    },
    {
      title: 'Gaming PC Setup - High Performance',
      description: 'Custom built gaming PC with RTX 4080, i7-13700K, 32GB RAM, 2TB NVMe SSD. Includes gaming monitor, mechanical keyboard, and RGB mouse. Perfect for 4K gaming.',
      price: 3200,
      location: 'Seattle, WA',
      images: JSON.stringify(['https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg']),
      categoryId: electronicsCategory?.id,
      userId: johnUser?.id,
      views: 278,
    },
    {
      title: 'Electric Bike - Almost New',
      description: 'RadPower electric bike with only 50 miles on it. 50-mile range, foldable design, perfect for commuting. Includes charger, lock, and helmet.',
      price: 1400,
      location: 'Denver, CO',
      images: JSON.stringify(['https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg']),
      categoryId: vehiclesCategory?.id,
      userId: janeUser?.id,
      views: 92,
    },
    {
      title: 'Cozy Studio Apartment for Rent',
      description: 'Beautiful studio apartment in downtown area. Newly renovated, hardwood floors, modern kitchen, great natural light. Pet-friendly building with gym and rooftop deck.',
      price: 1800,
      location: 'Chicago, IL',
      images: JSON.stringify(['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
      categoryId: realEstateCategory?.id,
      userId: johnUser?.id,
      views: 134,
    },
    {
      title: 'Freelance Web Developer Available',
      description: 'Experienced full-stack developer offering custom websites, e-commerce solutions, and web applications. React, Node.js, Python expertise. Competitive rates.',
      price: 75,
      location: 'Remote',
      images: JSON.stringify(['https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg']),
      categoryId: servicesCategory?.id,
      userId: janeUser?.id,
      views: 56,
    },
    {
      title: 'Road Bike - Carbon Fiber Frame',
      description: 'Lightweight carbon fiber road bike, Shimano 105 groupset, excellent for long rides and racing. Well maintained, new tires and chain. Includes pedals and water bottle cage.',
      price: 1200,
      location: 'Boulder, CO',
      images: JSON.stringify(['https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg']),
      categoryId: sportsCategory?.id,
      userId: johnUser?.id,
      views: 78,
    },
    {
      title: 'Collection of Programming Books',
      description: 'Large collection of programming and computer science books. Clean Code, Design Patterns, Algorithms, Python, JavaScript, and more. Great for students or developers.',
      price: 150,
      location: 'Boston, MA',
      images: JSON.stringify(['https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg']),
      categoryId: booksCategory?.id,
      userId: janeUser?.id,
      views: 43,
    },
    {
      title: 'Friendly Golden Retriever Puppy',
      description: 'Beautiful 8-week-old Golden Retriever puppy looking for loving home. Vaccinated, health checked, comes with papers. Great with kids and other pets.',
      price: 800,
      location: 'Nashville, TN',
      images: JSON.stringify(['https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg']),
      categoryId: petsCategory?.id,
      userId: johnUser?.id,
      views: 267,
    },
    {
      title: 'Vintage Leather Jacket - Size M',
      description: 'Authentic vintage leather motorcycle jacket from the 80s. Genuine leather, excellent condition, fits like modern medium. Classic style that never goes out of fashion.',
      price: 280,
      location: 'Brooklyn, NY',
      images: JSON.stringify(['https://images.pexels.com/photos/1813947/pexels-photo-1813947.jpeg']),
      categoryId: fashionCategory?.id,
      userId: janeUser?.id,
      views: 112,
    },
    {
      title: 'Modern Sectional Sofa',
      description: 'Large L-shaped sectional sofa in charcoal gray. Memory foam cushions, stain-resistant fabric, seats 6 comfortably. Less than 2 years old, excellent condition.',
      price: 950,
      location: 'Phoenix, AZ',
      images: JSON.stringify(['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg']),
      categoryId: homeCategory?.id,
      userId: johnUser?.id,
      views: 87,
    },
    {
      title: 'Samsung 65" 4K Smart TV',
      description: 'Samsung QN65Q80A 65-inch 4K QLED Smart TV. Excellent picture quality, HDR support, built-in streaming apps. Perfect for movies and gaming. Includes remote and wall mount.',
      price: 1100,
      location: 'Dallas, TX',
      images: JSON.stringify(['https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg']),
      categoryId: electronicsCategory?.id,
      userId: janeUser?.id,
      views: 198,
    },
    {
      title: '2020 Tesla Model 3 - Autopilot',
      description: 'Tesla Model 3 Standard Range Plus with Autopilot, 35,000 miles, excellent condition. Supercharger included, mobile connector, all maintenance records available.',
      price: 32000,
      location: 'San Jose, CA',
      images: JSON.stringify(['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg']),
      categoryId: vehiclesCategory?.id,
      userId: johnUser?.id,
      featured: true,
      views: 445,
    },
    {
      title: 'Professional House Cleaning Service',
      description: 'Reliable and thorough house cleaning service. Licensed, insured, and bonded. Weekly, bi-weekly, or monthly service available. Free estimates, eco-friendly products.',
      price: 120,
      location: 'Atlanta, GA',
      images: JSON.stringify(['https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg']),
      categoryId: servicesCategory?.id,
      userId: janeUser?.id,
      views: 76,
    },
    {
      title: 'Home Gym Equipment Set',
      description: 'Complete home gym setup including adjustable dumbbells, bench, pull-up bar, resistance bands, and yoga mat. Perfect for small spaces, barely used.',
      price: 650,
      location: 'Tampa, FL',
      images: JSON.stringify(['https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg']),
      categoryId: sportsCategory?.id,
      userId: johnUser?.id,
      views: 123,
    },
    {
      title: 'Wedding Dress - Size 8',
      description: 'Beautiful A-line wedding dress in ivory, size 8. Worn once, professionally cleaned and preserved. Lace details, chapel train, includes veil and undergarments.',
      price: 800,
      location: 'Orlando, FL',
      images: JSON.stringify(['https://images.pexels.com/photos/1464230/pexels-photo-1464230.jpeg']),
      categoryId: fashionCategory?.id,
      userId: janeUser?.id,
      views: 89,
    },
    {
      title: 'Office Desk - Standing/Sitting',
      description: 'Electric height-adjustable desk, 60" wide, memory presets, cable management. Perfect for home office, improves productivity and health. Barely used.',
      price: 420,
      location: 'Minneapolis, MN',
      images: JSON.stringify(['https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg']),
      categoryId: homeCategory?.id,
      userId: johnUser?.id,
      views: 67,
    },
    {
      title: 'Nintendo Switch OLED - Like New',
      description: 'Nintendo Switch OLED model with 5 games including Zelda, Mario Kart, and Animal Crossing. Pro controller, carrying case, and screen protector included.',
      price: 380,
      location: 'Charlotte, NC',
      images: JSON.stringify(['https://images.pexels.com/photos/1462725/pexels-photo-1462725.jpeg']),
      categoryId: electronicsCategory?.id,
      userId: janeUser?.id,
      views: 156,
    },
    {
      title: 'Motorcycle - Honda CBR600RR',
      description: '2019 Honda CBR600RR sport bike, 8,000 miles, garage kept, never dropped. Full service history, new tires, runs perfectly. Clean title, ready to ride.',
      price: 9500,
      location: 'Las Vegas, NV',
      images: JSON.stringify(['https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg']),
      categoryId: vehiclesCategory?.id,
      userId: johnUser?.id,
      views: 234,
    },
    {
      title: 'Piano Lessons - All Ages',
      description: 'Experienced piano teacher offering lessons for beginners to advanced students. Classical, jazz, and popular music styles. In-home or studio lessons available.',
      price: 50,
      location: 'Richmond, VA',
      images: JSON.stringify(['https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg']),
      categoryId: servicesCategory?.id,
      userId: janeUser?.id,
      views: 45,
    },
    {
      title: 'Golf Club Set - Complete',
      description: 'Complete golf set for beginners: driver, irons, putter, sand wedge, golf bag with stand. Great starter set, excellent condition, ready to play.',
      price: 320,
      location: 'Scottsdale, AZ',
      images: JSON.stringify(['https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg']),
      categoryId: sportsCategory?.id,
      userId: johnUser?.id,
      views: 78,
    },
    {
      title: 'Vintage Vinyl Records Collection',
      description: 'Collection of 200+ vintage vinyl records from 60s-80s. Rock, jazz, classical, some rare pressings. Well preserved, stored properly. Great for collectors.',
      price: 1500,
      location: 'Portland, OR',
      images: JSON.stringify(['https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg']),
      categoryId: electronicsCategory?.id,
      userId: janeUser?.id,
      views: 167,
    },
    {
      title: 'Maine Coon Kittens Available',
      description: 'Adorable Maine Coon kittens, 10 weeks old, litter trained, first shots completed. Parents on site, excellent temperament, great with children.',
      price: 600,
      location: 'Portland, ME',
      images: JSON.stringify(['https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg']),
      categoryId: petsCategory?.id,
      userId: johnUser?.id,
      views: 189,
    },
    {
      title: 'Designer Sunglasses Collection',
      description: 'Collection of authentic designer sunglasses: Ray-Ban, Oakley, Prada, Gucci. All original cases and authenticity cards included. Excellent condition.',
      price: 450,
      location: 'Miami Beach, FL',
      images: JSON.stringify(['https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg']),
      categoryId: fashionCategory?.id,
      userId: janeUser?.id,
      views: 98,
    },
    {
      title: 'Garden Tool Set - Professional',
      description: 'Professional grade garden tools including spades, pruners, hoes, rake, wheelbarrow. High quality steel construction, perfect for serious gardeners.',
      price: 280,
      location: 'Sacramento, CA',
      images: JSON.stringify(['https://images.pexels.com/photos/4503267/pexels-photo-4503267.jpeg']),
      categoryId: homeCategory?.id,
      userId: johnUser?.id,
      views: 54,
    },
    {
      title: 'Drone with 4K Camera',
      description: 'DJI Mini 3 Pro drone with 4K camera, 3-axis gimbal, obstacle avoidance. Includes extra batteries, SD card, carrying case. Perfect for photography and videography.',
      price: 950,
      location: 'Salt Lake City, UT',
      images: JSON.stringify(['https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg']),
      categoryId: electronicsCategory?.id,
      userId: johnUser?.id,
      featured: true,
      views: 245,
    },
  ]

  for (const listing of listings) {
    if (listing.categoryId && listing.userId) {
      await prisma.listing.create({
        data: {
          ...listing,
          categoryId: listing.categoryId as string,
          userId: listing.userId as string,
        },
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