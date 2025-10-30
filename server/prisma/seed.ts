import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create users
  console.log("Creating users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "john.doe@example.com",
        password: hashedPassword,
        name: "John Doe",
        age: 28,
        gender: "male",
        bio: "Software engineer who loves hiking, photography, and trying new restaurants. Looking for someone to share adventures with!",
        interestedIn: "female",
        preferenceMinAge: 24,
        preferenceMaxAge: 35,
        preferenceDistance: 50,
        latitude: 40.7128,
        longitude: -74.006,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "jane.smith@example.com",
        password: hashedPassword,
        name: "Jane Smith",
        age: 26,
        gender: "female",
        bio: "Marketing professional with a passion for yoga, cooking, and travel. Coffee enthusiast ☕",
        interestedIn: "male",
        preferenceMinAge: 25,
        preferenceMaxAge: 32,
        preferenceDistance: 40,
        latitude: 40.7589,
        longitude: -73.9851,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "mike.johnson@example.com",
        password: hashedPassword,
        name: "Mike Johnson",
        age: 32,
        gender: "male",
        bio: "Fitness trainer and outdoor enthusiast. Love rock climbing, surfing, and beach volleyball. Let's stay active together! 🏋️",
        interestedIn: "female",
        preferenceMinAge: 23,
        preferenceMaxAge: 35,
        preferenceDistance: 60,
        latitude: 40.7306,
        longitude: -73.9352,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "emily.brown@example.com",
        password: hashedPassword,
        name: "Emily Brown",
        age: 29,
        gender: "female",
        bio: "Artist and musician. I paint, play guitar, and love live music. Looking for someone creative and fun! 🎨🎸",
        interestedIn: "everyone",
        preferenceMinAge: 26,
        preferenceMaxAge: 38,
        preferenceDistance: 45,
        latitude: 40.7484,
        longitude: -73.9857,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "alex.garcia@example.com",
        password: hashedPassword,
        name: "Alex Garcia",
        age: 30,
        gender: "male",
        bio: "Chef and foodie. Love experimenting with new recipes. Dog dad to a golden retriever 🐕",
        interestedIn: "female",
        preferenceMinAge: 25,
        preferenceMaxAge: 34,
        preferenceDistance: 50,
        latitude: 40.758,
        longitude: -73.9855,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah.wilson@example.com",
        password: hashedPassword,
        name: "Sarah Wilson",
        age: 27,
        gender: "female",
        bio: "Teacher by day, bookworm by night. Love reading, writing, and cozy coffee shops. Looking for intellectual conversations 📚",
        interestedIn: "male",
        preferenceMinAge: 26,
        preferenceMaxAge: 35,
        preferenceDistance: 35,
        latitude: 40.7614,
        longitude: -73.9776,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "david.martinez@example.com",
        password: hashedPassword,
        name: "David Martinez",
        age: 31,
        gender: "male",
        bio: "Tech entrepreneur. Love startups, innovation, and traveling. Always up for new experiences! ✈️",
        interestedIn: "female",
        preferenceMinAge: 24,
        preferenceMaxAge: 33,
        preferenceDistance: 55,
        latitude: 40.7489,
        longitude: -73.968,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "lisa.anderson@example.com",
        password: hashedPassword,
        name: "Lisa Anderson",
        age: 25,
        gender: "female",
        bio: "Dancer and fitness instructor. Love staying active and healthy. Vegan foodie 🥗🌱",
        interestedIn: "everyone",
        preferenceMinAge: 23,
        preferenceMaxAge: 32,
        preferenceDistance: 40,
        latitude: 40.7282,
        longitude: -74.0776,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "chris.taylor@example.com",
        password: hashedPassword,
        name: "Chris Taylor",
        age: 29,
        gender: "male",
        bio: "Photographer and videographer. Love capturing moments and telling stories through images 📷",
        interestedIn: "female",
        preferenceMinAge: 24,
        preferenceMaxAge: 32,
        preferenceDistance: 50,
        latitude: 40.7505,
        longitude: -73.9934,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "amanda.lee@example.com",
        password: hashedPassword,
        name: "Amanda Lee",
        age: 28,
        gender: "female",
        bio: "Fashion designer with a love for art, music festivals, and travel. Always looking for the next adventure! 🌍",
        interestedIn: "male",
        preferenceMinAge: 27,
        preferenceMaxAge: 35,
        preferenceDistance: 45,
        latitude: 40.7411,
        longitude: -73.9897,
        isOnline: false,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create some swipes (likes and dislikes)
  console.log("Creating swipes...");
  const swipes = await Promise.all([
    // John likes Jane, Emily, Sarah
    prisma.swipe.create({
      data: { userId: users[0].id, targetId: users[1].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[0].id, targetId: users[3].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[0].id, targetId: users[5].id, action: "like" },
    }),
    // John dislikes Lisa
    prisma.swipe.create({
      data: { userId: users[0].id, targetId: users[7].id, action: "dislike" },
    }),

    // Jane likes John, Mike, David
    prisma.swipe.create({
      data: { userId: users[1].id, targetId: users[0].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[1].id, targetId: users[2].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[1].id, targetId: users[6].id, action: "like" },
    }),

    // Mike likes Jane, Emily
    prisma.swipe.create({
      data: { userId: users[2].id, targetId: users[1].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[2].id, targetId: users[3].id, action: "like" },
    }),

    // Emily likes Mike, Alex
    prisma.swipe.create({
      data: { userId: users[3].id, targetId: users[2].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[3].id, targetId: users[4].id, action: "like" },
    }),

    // Sarah likes John, Alex, Chris
    prisma.swipe.create({
      data: { userId: users[5].id, targetId: users[0].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[5].id, targetId: users[4].id, action: "like" },
    }),
    prisma.swipe.create({
      data: { userId: users[5].id, targetId: users[8].id, action: "like" },
    }),
  ]);

  console.log(`Created ${swipes.length} swipes`);

  // Create matches (mutual likes)
  console.log("Creating matches...");
  const matches = await Promise.all([
    // John and Jane matched
    prisma.match.create({
      data: {
        user1Id: users[0].id,
        user2Id: users[1].id,
      },
    }),
    // Mike and Jane matched
    prisma.match.create({
      data: {
        user1Id: users[2].id,
        user2Id: users[1].id,
      },
    }),
    // Mike and Emily matched
    prisma.match.create({
      data: {
        user1Id: users[2].id,
        user2Id: users[3].id,
      },
    }),
    // John and Sarah matched
    prisma.match.create({
      data: {
        user1Id: users[0].id,
        user2Id: users[5].id,
      },
    }),
  ]);

  console.log(`Created ${matches.length} matches`);

  // Create messages between matched users
  console.log("Creating messages...");
  const messages = await Promise.all([
    // Conversation between John and Jane
    prisma.message.create({
      data: {
        senderId: users[0].id,
        receiverId: users[1].id,
        matchId: matches[0].id,
        content: "Hi Jane! Love your profile, we seem to have a lot in common!",
        read: true,
        readAt: new Date(),
      },
    }),
    prisma.message.create({
      data: {
        senderId: users[1].id,
        receiverId: users[0].id,
        matchId: matches[0].id,
        content:
          "Thanks John! I noticed you love hiking. What's your favorite trail?",
        read: true,
        readAt: new Date(),
      },
    }),
    prisma.message.create({
      data: {
        senderId: users[0].id,
        receiverId: users[1].id,
        matchId: matches[0].id,
        content:
          "I love the trails in Bear Mountain! Have you been? We should go sometime!",
        read: false,
      },
    }),

    // Conversation between Mike and Jane
    prisma.message.create({
      data: {
        senderId: users[2].id,
        receiverId: users[1].id,
        matchId: matches[1].id,
        content:
          "Hey! Fellow fitness enthusiast here. Do you work out regularly?",
        read: true,
        readAt: new Date(),
      },
    }),
    prisma.message.create({
      data: {
        senderId: users[1].id,
        receiverId: users[2].id,
        matchId: matches[1].id,
        content:
          "Yes! I do yoga 3-4 times a week. I've been wanting to try rock climbing!",
        read: false,
      },
    }),

    // Conversation between Mike and Emily
    prisma.message.create({
      data: {
        senderId: users[3].id,
        receiverId: users[2].id,
        matchId: matches[2].id,
        content: "Hi Mike! Your profile says you love the outdoors. Me too! 🏔️",
        read: true,
        readAt: new Date(),
      },
    }),

    // Conversation between John and Sarah
    prisma.message.create({
      data: {
        senderId: users[5].id,
        receiverId: users[0].id,
        matchId: matches[3].id,
        content:
          "Hi! I saw you're into photography. Do you have a favorite subject?",
        read: false,
      },
    }),
  ]);

  console.log(`Created ${messages.length} messages`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\nTest accounts created:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  users.forEach((user) => {
    console.log(`📧 ${user.email}`);
    console.log(`   Password: password123`);
    console.log(`   Name: ${user.name} (${user.age}, ${user.gender})`);
    console.log("");
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nYou can login with any of these accounts!");
  console.log("All passwords are: password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
