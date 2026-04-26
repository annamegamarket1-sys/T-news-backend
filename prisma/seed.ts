import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const user1 = await prisma.user.create({
    data: {
      username: 'Сенека',
      passwordHash: hashedPassword,
      bio: 'Римский философ-стоик',
      avatar: 'seneka.png',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'Эпиктет',
      passwordHash: hashedPassword,
      bio: 'Греческий философ-стоик',
      avatar: 'epictetus.png',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'Калигула',
      passwordHash: hashedPassword,
      bio: 'Римский император и философ',
      avatar: 'kaligula.png',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      username: 'Пользователь',
      passwordHash: hashedPassword,
      bio: 'Тестовый пользователь',
      avatar: 'default.png',
    },
  });

  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      content:
        'Человек, которого застеклённые окна защищали от малейшего дуновения... подвергается смертельной опасности, даже если его коснётся самый лёгкий ветерок.',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user1.id,
      content:
        'Говорят, что Гай Цезарь отличался помимо прочих немалочисленных своих пороков каким-то удивительным сладострастием в оскорблениях...',
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: 'Измени своё мнение, если оно ошибочно.',
    },
  });

  const post4 = await prisma.post.create({
    data: {
      userId: user2.id,
      content: 'Не тот беден, кто имеет мало, а тот, кто хочет иметь больше.',
    },
  });

  const post5 = await prisma.post.create({
    data: {
      userId: user2.id,
      content: 'Познай самого себя.',
    },
  });

  const post6 = await prisma.post.create({
    data: {
      userId: user3.id,
      content: 'Счастье вашей жизни зависит от качества ваших мыслей.',
    },
  });

  await prisma.like.create({ data: { userId: user2.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: user3.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: user4.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: user1.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: user3.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: user1.id, postId: post6.id } });

  await prisma.comment.create({
    data: {
      userId: user2.id,
      postId: post1.id,
      content: 'Мудро сказано!',
    },
  });

  await prisma.comment.create({
    data: {
      userId: user3.id,
      postId: post1.id,
      content: 'Очень актуально в наше время.',
    },
  });

  await prisma.comment.create({
    data: {
      userId: user1.id,
      postId: post4.id,
      content: 'Согласен на 100%.',
    },
  });

  await prisma.follow.create({
    data: { followerId: user4.id, followingId: user1.id },
  });
  await prisma.follow.create({
    data: { followerId: user4.id, followingId: user2.id },
  });
  await prisma.follow.create({
    data: { followerId: user4.id, followingId: user3.id },
  });
  await prisma.follow.create({
    data: { followerId: user1.id, followingId: user2.id },
  });
  await prisma.follow.create({
    data: { followerId: user2.id, followingId: user3.id },
  });
  await prisma.follow.create({
    data: { followerId: user3.id, followingId: user1.id },
  });
}

main()
  .catch((error) => {
    console.error('Ошибка при генерации данных:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
