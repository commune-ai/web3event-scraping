import EventModel from '../../../model/eventModel';
import { connectDB } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectDB();
    const eventId = params.id;
    const events = await EventModel.aggregate([
        {
          $match: { _id: new ObjectId(eventId) } // Filter by _id using the value from params
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
            'description_mirror': 1,
            featured_info_count: { $size: { $ifNull: ['$event.featured_info', []] } } // Count the featured_info elements
          }
        }
      ]);

    return new Response(JSON.stringify(events), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}