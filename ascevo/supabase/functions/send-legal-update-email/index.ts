import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  document_type: string;
  version: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    const { to, subject, html, document_type, version }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email via Resend (or your preferred email service)
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'GROWTHOVO <noreply@growthovo.app>',
          to: [to],
          subject,
          html,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error('Resend API error:', errorData);
        throw new Error(`Failed to send email: ${errorData}`);
      }

      const emailData = await emailResponse.json();
      console.log('Email sent successfully:', emailData);

      // Log the email notification in the database
      await supabase.from('legal_notification_log').insert({
        recipient_email: to,
        document_type,
        version,
        notification_type: 'email',
        sent_at: new Date().toISOString(),
        status: 'sent',
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          email_id: emailData.id,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Fallback: Log email would be sent (for development/testing)
      console.log('RESEND_API_KEY not configured. Email would be sent to:', to);
      console.log('Subject:', subject);
      
      // Log the notification attempt
      await supabase.from('legal_notification_log').insert({
        recipient_email: to,
        document_type,
        version,
        notification_type: 'email',
        sent_at: new Date().toISOString(),
        status: 'simulated',
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email simulated (RESEND_API_KEY not configured)',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error sending legal update email:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
