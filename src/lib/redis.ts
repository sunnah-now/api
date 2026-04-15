import Redis from 'ioredis';

const redisAddr = process.env.REDIS_ADDR || 'localhost:6379';
const redisPassword = process.env.REDIS_PASSWORD || '';
const redisDB = parseInt(process.env.REDIS_DB || '0', 10);

const [host, port] = redisAddr.split(':');

const redis = new Redis({
  host: host,
  port: parseInt(port, 10),
  password: redisPassword,
  db: redisDB,
});

export default redis;

export const bookMetaKey = (slug: string) => `book:${slug}:metadata`;
export const volumeHadithsKey = (slug: string, volId: number) => `book:${slug}:volume:${volId}:hadiths`;
export const chapterHadithsKey = (slug: string, chapId: number) => `book:${slug}:chapter:${chapId}:hadiths`;
export const bookHadithsKey = (slug: string) => `book:${slug}:hadiths`;
export const hadithIDKey = (id: number) => `hadith:${id}`;
export const authTokenKey = (token: string) => `auth:token:${token}`;
export const userStatsKey = (token: string) => `stats:user:${token}:calls`;
export const userDailyStatsKey = (token: string, day: string) => `stats:user:${token}:daily:${day}`;
