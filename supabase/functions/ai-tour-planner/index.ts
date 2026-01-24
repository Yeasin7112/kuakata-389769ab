import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client to query database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch real-time data from database for AI context
    const [hotelsResult, restaurantsResult, placesResult, roomsResult] = await Promise.all([
      supabase.from('hotels').select('id, name_bn, name_en, description_en, address_en, phone, price_range, rating').eq('is_active', true).limit(20),
      supabase.from('restaurants').select('id, name_bn, name_en, description_en, cuisine_type, price_range, rating, phone').eq('is_active', true).limit(20),
      supabase.from('places').select('id, name_bn, name_en, description_en, category, rating, distance_from_beach').eq('is_active', true).limit(20),
      supabase.from('hotel_rooms').select('id, hotel_id, name_en, room_type, price_per_night, max_guests, is_available, amenities').eq('is_active', true).eq('is_available', true).limit(50),
    ]);

    const hotels = hotelsResult.data || [];
    const restaurants = restaurantsResult.data || [];
    const places = placesResult.data || [];
    const rooms = roomsResult.data || [];

    // Build database context for AI
    const databaseContext = `
## LIVE DATABASE INFORMATION (Use this to answer questions accurately)

### Available Hotels (${hotels.length} total):
${hotels.map(h => `- ${h.name_en}: ${h.description_en || 'No description'}. Price: ${h.price_range || 'Contact for price'}. Rating: ${h.rating || 'N/A'}/5. Phone: ${h.phone || 'N/A'}`).join('\n')}

### Available Rooms:
${rooms.map(r => {
  const hotel = hotels.find(h => h.id === r.hotel_id);
  return `- ${r.name_en} at ${hotel?.name_en || 'Unknown Hotel'}: ${r.room_type} room, ৳${r.price_per_night}/night, Max ${r.max_guests} guests. ${r.is_available ? 'AVAILABLE' : 'NOT AVAILABLE'}. Amenities: ${r.amenities?.join(', ') || 'Standard'}`;
}).join('\n')}

### Restaurants (${restaurants.length} total):
${restaurants.map(r => `- ${r.name_en}: ${r.cuisine_type || 'Local'} cuisine. ${r.description_en || ''}. Price: ${r.price_range || '$$'}. Rating: ${r.rating || 'N/A'}/5. Phone: ${r.phone || 'N/A'}`).join('\n')}

### Tourist Places (${places.length} total):
${places.map(p => `- ${p.name_en}: ${p.category || 'tourist_spot'}. ${p.description_en || ''}. Distance from beach: ${p.distance_from_beach || 'N/A'}. Rating: ${p.rating || 'N/A'}/5`).join('\n')}

IMPORTANT: When users ask about hotel availability, room prices, restaurant details, or places - USE THE ABOVE DATA to give accurate answers. Always recommend checking availability by contacting the hotel directly for the most current information.
`;

    const systemPrompt = `You are an expert tour planner for Kuakata, Bangladesh - the "Daughter of the Sea" known for its stunning sunrise and sunset views over the Bay of Bengal.

${databaseContext}

You help travelers plan personalized itineraries based on their preferences. You have LIVE ACCESS to the database and can answer questions about:
- Hotel availability and room prices
- Restaurant recommendations with actual ratings
- Tourist spots with real descriptions
- Current pricing information

When creating itineraries:
1. Consider the user's duration, budget, interests, and group type
2. Include specific timing recommendations (sunrise is around 5:30-6:00 AM, sunset around 5:30-6:00 PM)
3. Suggest meals at local restaurants from the database
4. Include safety tips relevant to activities
5. Provide estimated costs in Bangladeshi Taka (BDT) using real prices from database
6. Use Bengali phrases where appropriate with English translations

Format your responses clearly with:
- Day-by-day breakdown when planning trips
- Time slots for activities
- Estimated costs based on real database prices
- Pro tips and local insights

When users ask about specific hotels, rooms, or restaurants - ALWAYS use the live database information above to give accurate answers.

Be friendly, enthusiastic, and helpful. Use emojis sparingly to make responses engaging.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Tour planner error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
