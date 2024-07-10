import redis.asyncio as redis

class RedisCache:
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379")

    async def get(self, key):
        value = await self.redis.get(key)
        return value.decode("utf-8") if value else None

    async def set(self, key, value, expire=4800):
        await self.redis.set(key, value, ex=expire)

    async def delete(self, key):
        await self.redis.delete(key)