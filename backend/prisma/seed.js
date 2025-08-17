const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data
  await prisma.prediction.deleteMany();
  await prisma.track.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create sample users
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'dj@example.com',
      passwordHash
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'producer@example.com',
      passwordHash
    }
  });

  console.log('👥 Created sample users');

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'tech-house' } }),
    prisma.tag.create({ data: { name: 'disco-house' } }),
    prisma.tag.create({ data: { name: 'uk-garage' } }),
    prisma.tag.create({ data: { name: 'mainstage-edm' } }),
    prisma.tag.create({ data: { name: 'deep-house' } }),
    prisma.tag.create({ data: { name: 'progressive-house' } }),
    prisma.tag.create({ data: { name: 'acid-house' } }),
    prisma.tag.create({ data: { name: 'minimal-techno' } })
  ]);

  console.log('🏷️ Created sample tags');

  // Create sample tracks
  const tracks = await Promise.all([
    prisma.track.create({
      data: {
        title: 'Midnight Groove',
        fileUrl: 'https://example.com/tracks/midnight-groove.mp3',
        userId: user1.id
      }
    }),
    prisma.track.create({
      data: {
        title: 'Summer Vibes',
        fileUrl: 'https://example.com/tracks/summer-vibes.mp3',
        userId: user1.id
      }
    }),
    prisma.track.create({
      data: {
        title: 'Deep Underground',
        fileUrl: 'https://example.com/tracks/deep-underground.mp3',
        userId: user2.id
      }
    }),
    prisma.track.create({
      data: {
        title: 'Electric Dreams',
        fileUrl: 'https://example.com/tracks/electric-dreams.mp3',
        userId: user2.id
      }
    })
  ]);

  console.log('🎵 Created sample tracks');

  // Create sample predictions
  const predictions = await Promise.all([
    // Track 1 predictions
    prisma.prediction.create({
      data: {
        trackId: tracks[0].id,
        tagId: tags[0].id, // tech-house
        confidence: 0.85
      }
    }),
    prisma.prediction.create({
      data: {
        trackId: tracks[0].id,
        tagId: tags[4].id, // deep-house
        confidence: 0.72
      }
    }),
    
    // Track 2 predictions
    prisma.prediction.create({
      data: {
        trackId: tracks[1].id,
        tagId: tags[1].id, // disco-house
        confidence: 0.91
      }
    }),
    prisma.prediction.create({
      data: {
        trackId: tracks[1].id,
        tagId: tags[5].id, // progressive-house
        confidence: 0.68
      }
    }),
    
    // Track 3 predictions
    prisma.prediction.create({
      data: {
        trackId: tracks[2].id,
        tagId: tags[7].id, // minimal-techno
        confidence: 0.88
      }
    }),
    prisma.prediction.create({
      data: {
        trackId: tracks[2].id,
        tagId: tags[6].id, // acid-house
        confidence: 0.75
      }
    }),
    
    // Track 4 predictions
    prisma.prediction.create({
      data: {
        trackId: tracks[3].id,
        tagId: tags[3].id, // mainstage-edm
        confidence: 0.94
      }
    }),
    prisma.prediction.create({
      data: {
        trackId: tracks[3].id,
        tagId: tags[5].id, // progressive-house
        confidence: 0.79
      }
    })
  ]);

  console.log('🔮 Created sample predictions');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📊 Sample data created:');
  console.log(`   👥 Users: ${await prisma.user.count()}`);
  console.log(`   🏷️ Tags: ${await prisma.tag.count()}`);
  console.log(`   🎵 Tracks: ${await prisma.track.count()}`);
  console.log(`   🔮 Predictions: ${await prisma.prediction.count()}`);
  
  console.log('\n🔑 Test credentials:');
  console.log('   Email: dj@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
