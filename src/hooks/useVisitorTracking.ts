import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const VISITOR_ID_KEY = 'ourkuakata_visitor_id';
const SESSION_ID_KEY = 'ourkuakata_session_id';
const SESSION_EXPIRY_KEY = 'ourkuakata_session_expiry';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

function generateVisitorId(): string {
  return 'v_' + crypto.randomUUID();
}

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function detectDevice() {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return {
    deviceType,
    browser,
    os,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    userAgent: ua,
  };
}

async function getOrCreateSession(visitorId: string): Promise<string | null> {
  const now = Date.now();
  const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);
  const expiry = Number(sessionStorage.getItem(SESSION_EXPIRY_KEY) || '0');

  if (existingSessionId && now < expiry) {
    sessionStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_DURATION));
    // Update last_active_at
    supabase
      .from('visitor_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', existingSessionId)
      .then();
    return existingSessionId;
  }

  const device = detectDevice();
  const { data, error } = await supabase
    .from('visitor_sessions')
    .insert({
      visitor_id: visitorId,
      device_type: device.deviceType,
      browser: device.browser,
      os: device.os,
      screen_width: device.screenWidth,
      screen_height: device.screenHeight,
      language: device.language,
      referrer: document.referrer || null,
      user_agent: device.userAgent,
    })
    .select('id')
    .single();

  if (error || !data) return null;

  sessionStorage.setItem(SESSION_ID_KEY, data.id);
  sessionStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_DURATION));
  return data.id;
}

export function useVisitorTracking() {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string>(getVisitorId());

  const trackEvent = useCallback(
    async (eventType: string, extra?: { pagePath?: string; pageTitle?: string; elementText?: string; elementType?: string }) => {
      if (!sessionIdRef.current) {
        sessionIdRef.current = await getOrCreateSession(visitorIdRef.current);
      }
      if (!sessionIdRef.current) return;

      await supabase.from('visitor_events').insert({
        session_id: sessionIdRef.current,
        visitor_id: visitorIdRef.current,
        event_type: eventType,
        page_path: extra?.pagePath || location.pathname,
        page_title: extra?.pageTitle || document.title,
        element_text: extra?.elementText || null,
        element_type: extra?.elementType || null,
      });
    },
    [location.pathname]
  );

  // Track page views on route change
  useEffect(() => {
    trackEvent('page_view', { pagePath: location.pathname, pageTitle: document.title });
  }, [location.pathname]);

  // Track clicks on interactive elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('a, button, [role="button"], [data-track]');
      if (!clickable) return;

      const text = (clickable.textContent || '').trim().slice(0, 100);
      const type = clickable.tagName.toLowerCase();
      const href = (clickable as HTMLAnchorElement).href || '';

      trackEvent('click', {
        elementText: text,
        elementType: `${type}${href ? ` → ${new URL(href, window.location.origin).pathname}` : ''}`,
      });
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [trackEvent]);

  return { trackEvent };
}
