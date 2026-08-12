import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

async function seed() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nextgen_db';

  console.log('🌱 Starting database seeding with Faker.js...');
  const pool = new Pool({ connectionString, max: 1 });
  const db = drizzle(pool, { schema });

  try {
    // 1. Clean existing records
    console.log('🧹 Clearing existing test data...');
    await db.delete(schema.posts);
    await db.delete(schema.users);

    // 2. Generate 20 mock users with guaranteed unique emails
    console.log('👥 Generating 20 realistic users with unique emails...');
    const userRecords: schema.NewUser[] = [];
    const usedEmails = new Set<string>();

    while (userRecords.length < 20) {
      const email = faker.internet.email().toLowerCase();
      if (!usedEmails.has(email)) {
        usedEmails.add(email);
        userRecords.push({
          name: faker.person.fullName(),
          email,
          bio: faker.person.bio(),
          isActive: faker.datatype.boolean(0.85),
        });
      }
    }

    const insertedUsers = await db.insert(schema.users).values(userRecords).returning();
    console.log(`✅ Inserted ${insertedUsers.length} users.`);

    // 3. Generate 40 mock posts associated with users
    console.log('📝 Generating 40 related posts...');
    const postRecords: schema.NewPost[] = Array.from({ length: 40 }).map((_, idx) => {
      const randomUser = faker.helpers.arrayElement(insertedUsers);
      const title = faker.lorem.sentence({ min: 3, max: 8 });
      return {
        title,
        slug: `${faker.helpers.slugify(title).toLowerCase()}-${idx}-${faker.string.alphanumeric(6)}`,
        content: faker.lorem.paragraphs({ min: 2, max: 5 }),
        isPublished: faker.datatype.boolean(0.75),
        authorId: randomUser.id,
      };
    });

    const insertedPosts = await db.insert(schema.posts).values(postRecords).returning();
    console.log(`✅ Inserted ${insertedPosts.length} posts.`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(
      '💡 Tip: Run `npm run db:studio` to inspect your newly seeded data in Drizzle Studio.',
    );
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
