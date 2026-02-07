import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the requester is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requester }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !requester) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requester is admin or super admin
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: requester.id, _role: 'admin' });
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { _user_id: requester.id });

    if (!isAdmin && !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, role, full_name } = await req.json();

    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validRoles = ['hotel_owner', 'restaurant_owner'];
    // For guides we use 'user' role but link user_id
    const assignRole = validRoles.includes(role) ? role : 'user';

    // Try to create the user
    let userId: string;

    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || '' },
    });

    if (createError) {
      // If user already exists, find them
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users?.find(u => u.email === email);

      if (existingUser) {
        userId = existingUser.id;
        // Update their password
        await supabase.auth.admin.updateUserById(userId, { password });
      } else {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      userId = authData.user!.id;
    }

    // Assign the role (upsert to avoid duplicates)
    if (assignRole !== 'user' || role === 'guide') {
      const roleToAssign = role === 'guide' ? 'user' : assignRole;
      await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: roleToAssign },
          { onConflict: 'user_id,role' }
        );
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
