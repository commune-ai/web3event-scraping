import fs from 'fs';
import path from 'path';
import EventModel from '../../model/eventModel';
import { connectDB } from '../../../lib/mongodb';

export async function GET() {
    await connectDB();

    const filePath = path.join(process.cwd(), 'script', 'luma_events.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    let saveData = extractEventData(data);

    try {
        // await EventModel.updateOne(saveData[0]);
        const bulkOps = saveData.map(event => ({
            updateOne: {
                filter: { api_id: event.api_id },
                update: { $set: event },
                upsert: true
            }
        }));

        await EventModel.bulkWrite(bulkOps);
        console.log('Data successfully saved or updated in EventModel');
        console.log('Data successfully saved to EventModel');
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error saving data to EventModel:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

function extractEventData(data) {
    return data.map(item => ({
        api_id: item.api_id,
        calendar: {
            api_id: item.calendar.api_id,
            avatar_url: item.calendar.avatar_url,
            cover_image_url: item.calendar.cover_image_url,
            description_short: item.calendar.description_short,
            geo_city: item.calendar.geo_city,
            geo_country: item.calendar.geo_country,
            geo_region: item.calendar.geo_region,
            payment_methods: item.calendar.payment_methods || [], // Ensure it's an array
            personal_user_api_id: item.calendar.personal_user_api_id,
            social_image_url: item.calendar.social_image_url,
            stripe_account_id: item.calendar.stripe_account_id,
            timezone: item.calendar.timezone,
            tint_color: item.calendar.tint_color || '',
            verified_at: item.calendar.verified_at,
            website: item.calendar.website,
            youtube_handle: item.calendar.youtube_handle,
        },
        description_mirror: item.description_mirror || {}, // Default to an empty object if undefined
        event: {
            api_id: item.event.api_id,
            calendar_api_id: item.event.calendar_api_id,
            cover_url: item.event.cover_url,
            end_at: item.event.end_at,
            geo_address_info: item.event.geo_address_info || {}, // Keep this as is; defaults to an empty object if undefined
            name: item.event.name,
            start_at: item.event.start_at,
            timezone: item.event.timezone || null, // Default to null if undefined
        },
        featured_guests: item.featured_guests || [], // Ensure it's an array
        featured_infos: item.featured_infos && Array.isArray(item.featured_infos) ? [
            item.featured_infos.find(info => info.type === "discover") || { type: "discover" },
            ...(item.featured_infos.filter(info => info.type !== "discover") || []),
            item.featured_infos.find(info => info.type === "calendar") || {}
        ].filter(info => Object.keys(info).length > 0) : [],
        solana_address_requirement: item.solana_address_requirement || null, // Default to null if undefined
        sold_out: item.sold_out,
        stripe_account_id: item.stripe_account_id || null, // Default to null if undefined
        theme_meta: item.theme_meta || {}, // Default to an empty object if undefined
        ticket_types: item.ticket_types || [] // Ensure it's an array
    }));
}