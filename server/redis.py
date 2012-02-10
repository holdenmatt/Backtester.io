import redis
import urlparse

# redis:// URL used to cache quotes.
REDIS_URL = os.environ.get('REDISTOGO_URL')

if REDIS_URL:
    self.redis = connect_to_redis(REDIS_URL)
else:
    raise Exception('redis:// URL not found')

def connect_to_redis(redis_url):
    """
    Return a redis client connected to a given redis:// URL.
    """
    urlparse.uses_netloc.append('redis')
    url = urlparse.urlparse(redis_url)
    return redis.StrictRedis(
        host=url.hostname, port=url.port, db=0, password=url.password
    )

# Procfile.dev:
# REDISTOGO_URL=redis://localhost:6379/
# redis: redis-server