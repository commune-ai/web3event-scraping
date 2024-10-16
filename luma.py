import json
import asyncio
import logging
import httpx
import random
from aiolimiter import AsyncLimiter

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LumaScraper:
    def __init__(self, rate_limit=120, time_period=60, min_sleep=1, max_sleep=5):
        self.rate_limiter = AsyncLimiter(rate_limit, time_period)
        self.events = set()
        self.min_sleep = min_sleep
        self.max_sleep = max_sleep

    def get_random_ip(self):
        return f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,255)}"

    async def make_request(self, client, url, method="GET", max_retries=3):
        headers = {
            "X-Forwarded-For": self.get_random_ip(),
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        for attempt in range(max_retries):
            try:
                async with self.rate_limiter:
                    if method == "GET":
                        response = await client.get(url, headers=headers)
                    else:
                        response = await client.post(url, headers=headers)
                response.raise_for_status()
                
                sleep_time = random.uniform(self.min_sleep, self.max_sleep)
                logger.debug(f"Sleeping for {sleep_time:.2f} seconds")
                await asyncio.sleep(sleep_time)
                
                return response
            except httpx.HTTPStatusError as e:
                logger.warning(f"HTTP error occurred: {e}. Attempt {attempt + 1} of {max_retries}")
                if attempt == max_retries - 1:
                    raise
            except Exception as e:
                logger.error(f"An error occurred: {e}. Attempt {attempt + 1} of {max_retries}")
                if attempt == max_retries - 1:
                    raise
        
        raise Exception(f"Failed to make request after {max_retries} attempts")

    async def get_places_events(self, client, place_id, cursor=""):
        try:
            while True:
                url = f"https://api.lu.ma/discover/get-paginated-events?discover_place_api_id={place_id}&pagination_limit=25&pagination_cursor={cursor}"
                resp = await self.make_request(client, url)
                resp_json = resp.json()
                if not resp_json.get("entries"):
                    break
                for event in resp_json["entries"]:
                    self.events.add(event["event"]["api_id"])
                if not resp_json.get("has_more", False):
                    break
                cursor = resp_json["entries"][-1]["api_id"]
            logger.info(f"Collected events for place {place_id}")
        except Exception as e:
            logger.error(f"Error collecting events for place {place_id}: {e}")

    async def get_cal_events(self, client, cal_id, cursor=""):
        try:
            while True:
                url = f"https://api.lu.ma/calendar/get-items?calendar_api_id={cal_id}&period=future&pagination_cursor={cursor}&pagination_limit=20"
                resp = await self.make_request(client, url)
                resp_json = resp.json()
                if not resp_json.get("entries"):
                    break
                for event in resp_json["entries"]:
                    self.events.add(event["event"]["api_id"])
                if not resp_json.get("has_more", False):
                    break
                cursor = resp_json["entries"][-1]["api_id"]
            logger.info(f"Collected events for calendar {cal_id}")
        except Exception as e:
            logger.error(f"Error collecting events for calendar {cal_id}: {e}")

    async def get_event_data(self, client, event_id):
        try:
            response = await self.make_request(client, f"https://api.lu.ma/event/get?event_api_id={event_id}")
            event = response.json()
            return event
        except Exception as e:
            logger.error(f"Error fetching data for event {event_id}: {e}")
            return None

    async def scrape(self):
        async with httpx.AsyncClient() as client:
            try:
                logger.info("Getting places")
                response = await self.make_request(client, "https://api.lu.ma/discover/list-places")
                #  ---Featured Cities Updated Daily --- scrap
                placeData = response.json()
                places = [place["place"]["api_id"] for place in placeData["infos"]]

                logger.info("Getting calendars")
                response = await self.make_request(client, "https://api.lu.ma/calendar/get-featured-calendars")
                calendarData = response.json()
                calendars = [calendar["calendar"]["api_id"] for calendar in calendarData["infos"]]

                logger.info("Getting events")
                place_tasks = [self.get_places_events(client, place) for place in places]
                calendar_tasks = [self.get_cal_events(client, calendar) for calendar in calendars]
                
                await asyncio.gather(*place_tasks, *calendar_tasks)

                logger.info(f"Total events collected: {len(self.events)}")
                logger.info("Processing events")
                event_tasks = [self.get_event_data(client, event) for event in self.events]
                results = await asyncio.gather(*event_tasks)
                
                return [result for result in results if result is not None]
            except Exception as e:
                logger.error(f"An error occurred during scraping: {e}")
                return []

async def main():
    try:
        scraper = LumaScraper(min_sleep=1, max_sleep=5)
        results = await scraper.scrape()
        with open("luma_events.json", "w") as f:
            json.dump(results, f, indent=4)
        logger.info(f"Scraped {len(results)} events and saved to luma_events.json")
    except Exception as e:
        logger.error(f"An error occurred in the main function: {e}")

if __name__ == "__main__":
    asyncio.run(main())