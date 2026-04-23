import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { compileMorningBrief } from '@/lib/brief-compiler';

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== 'admin') {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  }
  const { date } = await req.json();
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  try {
    const markdown = await compileMorningBrief(supabase, date);
    const { error } = await supabase
      .from('morning_briefs')
      .upsert(
        { brief_date: date, content_markdown: markdown, published: true, compiled_at: new Date().toISOString() },
        { onConflict: 'brief_date' }
      );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
