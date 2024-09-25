import EventModel from '../../model/eventModel';
import { connectDB } from '../../../lib/mongodb';

export async function GET(req) {
    await connectDB();
    let events = {};
    const regions = ['Europe', 'Asia', 'America'];
    const currentDate = new Date();

    const aggregationPipeline = [{
            $match: {
                "event.end_at": { $gt: currentDate },
                "featured_infos.type": "discover"
            }
        },
        {
            $group: {
                _id: {
                    $arrayElemAt: [{
                            $filter: {
                                input: "$featured_infos",
                                as: "info",
                                cond: { $eq: ["$$info.type", "discover"] }
                            }
                        },
                        0
                    ]
                },
                count: { $sum: 1 },
                avatar: { $first: { $arrayElemAt: ["$featured_infos.avatar_url", 0] } },
                tint_color: { $first: "$calendar.tint_color" }
            }
        },
        {
            $match: {
                "_id.name": { $ne: null } // Filter out documents where name is null or empty
            }
        },
        {
            $project: {
                _id: 0,
                city: "$_id.name", // Get the name of the city
                count: 1,
                avatar: 1,
                tint_color: 1
            }
        }
    ];

    const promises = regions.map(region =>
        EventModel.aggregate([{
                $match: {
                    "event.timezone": { $regex: region, $options: 'i' }
                }
            },
            ...aggregationPipeline
        ])
    );

    const results = await Promise.all(promises);
    regions.forEach((region, index) => {
        events[region] = results[index];
    });

    return new Response(JSON.stringify(events), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}