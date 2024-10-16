const mongoose = require('mongoose');
const { Schema } = mongoose;

// Create the Event schema
const eventSchema = new Schema({
    api_id: { type: String, required: true },
    calendar: {
        api_id: { type: String, required: true },
        avatar_url: { type: String, required: true },
        cover_image_url: { type: String, required: true },
        description_short: { type: String, default: null },
        geo_city: { type: String, default: null },
        geo_country: { type: String, default: null },
        geo_region: { type: String, default: null },
        payment_methods: { type: [String], default: [] }, // Array of strings
        personal_user_api_id: { type: String, default: null },
        social_image_url: { type: String, default: null },
        stripe_account_id: { type: String, default: null },
        timezone: { type: String, default: null },
        tint_color: { type: String, default: null },
        verified_at: { type: Date, default: null },
        website: { type: String, default: null },
        youtube_handle: { type: String, default: null },
    },
    description_mirror: { type: Object, default: {} },
    event: {
        cover_url: { type: String, required: true },
        end_at: { type: Date, required: true },
        geo_address_info: {
            address: { type: String, default: null },
            city: { type: String, default: null },
            city_state: { type: String, default: null },
            country: { type: String, default: null },
            description: { type: String, default: null },
            full_address: { type: String, default: null },
            mode: { type: String, default: null },
            place_id: { type: String, default: null },
            region: { type: String, default: null },
            type: { type: String, default: null },
        },
        name: { type: String, required: true },
        start_at: { type: Date, required: true },
        timezone: { type: String, default: null },
    },
    featured_guests: { type: [Object], default: [] }, // Array of objects
    featured_infos: { type: [Object], default: [] }, // Array of objects
    solana_address_requirement: { type: String, default: null },
    sold_out: { type: Boolean, required: true },
    stripe_account_id: { type: String, default: null },
    theme_meta: { type: Object, default: {} }, // Default set as empty object
    ticket_types: [{
        api_id: { type: String, default: null },
        cents: { type: Number, default: null },
        currency: { type: String, default: null },
        description: { type: String, default: '' },
    }],
});

// Create the Event model
const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default EventModel;