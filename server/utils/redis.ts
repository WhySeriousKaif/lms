import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL as string;


 const redisClient = (): string => {
    if(REDIS_URL){
        console.log('✅ Connected to Redis successfully');
        return REDIS_URL;

    }
    throw new Error('REDIS_URL is not defined');
 }

 export const redis = new Redis(redisClient());