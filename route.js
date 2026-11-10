import { NextResponse } from 'next/server';
import { CATEGORIES } from '../../../lib/categories';
import { getSupabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const picks = body && typeof body.votes === 'object' && body.votes ? body.votes : null;
  if (!picks) return NextResponse.json({ error: 'No votes received.' }, { status: 400 });

  const rows = [];
  for (const cat of CATEGORIES) {
    const nomineeId = picks[cat.id];
    if (!cat.nominees.some((n) => n.id === nomineeId)) {
      return NextResponse.json({ error: `Missing or invalid choice for category ${cat.id}.` }, { status: 400 });
    }
    rows.push({ category_id: cat.id, nominee_id: nomineeId });
  }

  try {
    const { data, error } = await getSupabase().rpc('submit_votes', { p_votes: rows });
    if (error) throw error;
    return NextResponse.json({ ok: true, submissionId: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not save your votes. Please try again.' }, { status: 500 });
  }
}
