import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert tour planner for Kuakata, Bangladesh - the "Daughter of the Sea" known for its stunning sunrise and sunset views over the Bay of Bengal.

You help travelers plan personalized itineraries based on their preferences. You know about:
- Tourist spots: Kuakata Beach, Fatrar Char, Lebur Char, Jhau Bon (Casuarina Forest), Buddhist temples, Rakhaine villages
- Local experiences: Sunrise/sunset viewing, fishing with locals, dried fish markets, Buddhist monastery visits
- Food: Fresh seafood, traditional Rakhaine cuisine, beach-side restaurants
- Accommodation: Hotels, resorts, guesthouses for all budgets
- Safety: Beach safety tips, tide timings, best times to visit
- Transport: Local rickshaws, motorbikes, boats for island hopping

When creating itineraries:
1. Consider the user's duration, budget, interests, and group type
2. Include specific timing recommendations (sunrise is around 5:30-6:00 AM, sunset around 5:30-6:00 PM)
3. Suggest meals at local restaurants
4. Include safety tips relevant to activities
5. Provide estimated costs in Bangladeshi Taka (BDT)
6. Use Bengali phrases where appropriate with English translations

Format your responses clearly with:
- Day-by-day breakdown
- Time slots for activities
- Estimated costs
- Pro tips and local insights

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
