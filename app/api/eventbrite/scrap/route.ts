import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
    try {
        // Use puppeteer-core instead of puppeteer
        const browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.CHROME_PATH || undefined, // Use environment variable for Chrome path
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add these arguments for better compatibility
        });
        const page = await browser.newPage();

        const urls = [
            {url :`https://www.eventbrite.com/d/online/business--events/?page=`, pageNum: 51},
            {url :`https://www.eventbrite.com/d/online/food-and-drink--events/?page=`, pageNum: 51},
            {url :`https://www.eventbrite.com/d/online/health--events/?page=`, pageNum: 51},
            {url :`https://www.eventbrite.com/d/online/music--events/?page=`, pageNum: 14},
            {url :`https://www.eventbrite.com/d/online/auto-boat-and-air--events/?page=`, pageNum: 4},
            {url :`https://www.eventbrite.com/d/online/charity-and-causes--events/?page=`, pageNum: 51},
            {url :`https://www.eventbrite.com/d/online/music--events/?page=`, pageNum: 14},
        ];
        
        const events = [];

        for (const url of urls) {
            for (let pageNum = 1; pageNum <= url.pageNum; pageNum++) {
                const eventPageUrl = `${url.url}${pageNum}`;
                await page.goto(eventPageUrl, { waitUntil: 'networkidle0' });
                console.log(`Navigating to ${eventPageUrl}`);
                const pageEvents = await page.evaluate(() => {
                    const eventCards = document.querySelectorAll('.event-card-details');
                    return Array.from(eventCards).map(card => {
                        const titleElement = card.querySelector('h3');
                        const dateElement = card.querySelector('p:nth-of-type(1)');
                        const locationElement = card.querySelector('p:nth-of-type(2)');
                        const linkElement = card.querySelector('a');
                        return {
                            title: titleElement?.textContent?.trim() || '',
                            date: dateElement?.textContent?.trim() || '',
                            location: locationElement?.textContent?.trim() || '',
                            detail_url: linkElement?.href || '',
                        };
                    });
                });

                for (const event of pageEvents) {
                    await page.goto(event.detail_url, { waitUntil: 'networkidle0' });

                    const additionalDetails = await page.evaluate(() => {
                        const locationElement = document.querySelector('.location-info__address');
                        const descriptionElement = document.querySelector('.event-description__content');
                        return {
                            locationInfo: locationElement ? {
                                city: locationElement.querySelector('.location-info__address-text')?.textContent?.trim() || '',
                                description: locationElement.textContent?.match(/(?<=\n\s*)(.*?)(?=\s*\n|$)/)?.[0]?.trim() || ''
                            } : null,
                            description: descriptionElement?.innerHTML || ''
                        };
                    });

                    events.push({ ...event, ...additionalDetails });
                }

                console.log(`Scraped ${pageEvents.length} events from ${eventPageUrl}`);
            }
        }
        console.log(events);
        await browser.close();

        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error('Error scraping Eventbrite:', error);
        return NextResponse.json({ error: 'Failed to scrape Eventbrite', details: error.message }, { status: 500 });
    }
}