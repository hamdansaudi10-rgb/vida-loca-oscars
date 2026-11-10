import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = getSupabase();
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      db.rpc('get_results'),
      db.from('submissions').select('id', { count: 'exact', head: true }),
    ]);
    if (error) throw error;
    if (countError) throw countError;

    const counts = {};
    for (const r of data || []) {
      (counts[r.category_id] ||= {})[r.nominee_id] = Number(r.vote_count);
    }
    return NextResponse.json(
      { total: count || 0, counts },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not load results.' }, { status: 500 });
  }
}
