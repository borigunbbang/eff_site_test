import { createClient } from '@supabase/supabase-js';

// Node.js < 22 서버리스 환경에는 전역 WebSocket이 없어서,
// Supabase 클라이언트의 Realtime 초기화가 에러를 던짐 (기능 자체는 안 써도 발생).
// ws 패키지로 polyfill 해서 방지.
if (typeof globalThis.WebSocket === 'undefined') {
  const { default: WebSocket } = await import('ws');
  globalThis.WebSocket = WebSocket;
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY. .env(.local) 파일을 확인하세요.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
