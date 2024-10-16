import EventModel from '../../../model/eventModel';
import { connectDB } from '../../../../lib/mongodb';

export async function GET(req, { params }) {
    await connectDB();
    const cityName = params.name;
    const currentDate = new Date();
    const events = await EventModel.aggregate([{
            $match: { 'featured_infos.name': cityName, "event.end_at": { $gt: currentDate } },
        },
        {
            $project: {
                'api_url': 1,
                'calendar.country': 1,
                'event.cover_url': 1,
                'event.end_at': 1,
                'event.name': 1,
                'event.price': 1,
                'event.timezone': 1,
                'event.start_at': 1,
                'calendar.website': 1,
                'sold_out': 1,
                featured_info_count: { $size: { $ifNull: ['$event.featured_info', []] } } // Count the featured_info elements
            }
        }
    ]);

    return new Response(JSON.stringify(events), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}