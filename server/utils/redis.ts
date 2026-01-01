import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL as string;


 const redisClient = (): string => {
    if(REDIS_URL){
        console.log('✅ Redis URL configured');
        return REDIS_URL;

    }
    throw new Error('REDIS_URL is not defined');
 }

 export const redis = new Redis(redisClient(), {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
 });

 // Handle Redis connection events
 redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
 });

 redis.on('ready', () => {
    console.log('✅ Redis client ready');
 });

 redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
    // Don't crash the app, just log the error
 });

 redis.on('close', () => {
    console.warn('⚠️  Redis connection closed');
 });

 redis.on('reconnecting', () => {
    console.log('🔄 Reconnecting to Redis...');
 });

 // Connect to Redis
 redis.connect().catch((err) => {
    console.error('❌ Failed to connect to Redis:', err.message);
    console.warn('⚠️  Application will continue without Redis caching');
 });