import * as fs from 'fs';
import * as path from 'path';
import redis, {
  bookMetaKey,
  bookHadithsKey,
  volumeHadithsKey,
  chapterHadithsKey,
  hadithIDKey,
} from '../src/lib/redis';
import { Book, Hadith } from '../src/lib/models';

const DATABASE_DIR = process.env.DATABASE_DIR || '../database';

async function loadData() {
  const files = fs.readdirSync(DATABASE_DIR).filter((f) => f.endsWith('.json'));

  // Clear existing books set
  await redis.del('books');

  for (const file of files) {
    console.log(`Loading ${file}...`);
    const filePath = path.join(DATABASE_DIR, file);
    const data = fs.readFileSync(filePath, 'utf-8');
    const book: Book = JSON.parse(data);
    await saveBook(book);
    console.log(`Loaded ${book.slug}`);
  }

  console.log('Done.');
  process.exit(0);
}

async function saveBook(book: Book) {
  const slug = book.slug;
  const pipeline = redis.pipeline();

  pipeline.sadd('books', slug);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { volumes, ...metadata } = book;
  pipeline.set(bookMetaKey(slug), JSON.stringify(metadata));

  // Clear existing book data from bookHadithsKey(slug)
  pipeline.del(bookHadithsKey(slug));

  if (book.volumes) {
    for (const volume of book.volumes) {
      const volId = volume.id;
      pipeline.del(volumeHadithsKey(slug, volId));

      if (volume.chapters) {
        for (const chapter of volume.chapters) {
          const chapId = chapter.id;
          pipeline.del(chapterHadithsKey(slug, chapId));

          if (chapter.hadiths) {
            for (const hadith of chapter.hadiths) {
              const hadithData = JSON.stringify(hadith);

              pipeline.rpush(bookHadithsKey(slug), hadithData);
              pipeline.rpush(volumeHadithsKey(slug, volId), hadithData);
              pipeline.rpush(chapterHadithsKey(slug, chapId), hadithData);
              pipeline.set(hadithIDKey(hadith.id), hadithData);
            }
          }
        }
      }
    }
  }

  await pipeline.exec();
}

loadData().catch(console.error);
