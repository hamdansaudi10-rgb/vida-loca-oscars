'use client';
import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES } from '../lib/categories';

export default function Home() {
  const [view, setView] = useState('vote');
  const [sel, setSel] = useState({});
  const [missing, setMissing] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState(null);
  const [resError, setResError] = useState('');

  const loadResults = useCallback(async () => {
    try {
      const r = await fetch('/api/results', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      setResults(j);
      setResError('');
    } catch (e) {
      setResError('Could not load results right now.');
    }
  }, []);

  useEffect(() => {
    if (view !== 'results') return;
    loadResults();
    const t = setInterval(loadResults, 8000);
    return () => clearInterval(t);
  }, [view, loadResults]);

  const choose = (catId, nomId) => {
    setSel((s) => ({ ...s, [catId]: nomId }));
    setMissing((m) => m.filter((id) => id !== catId));
    setError('');
  };

  const trySubmit = () => {
    const miss = CATEGORIES.filter((c) => !sel[c.id]).map((c) => c.id);
    setMissing(miss);
    if (miss.length) {
      setError(`Please choose a nominee in ${miss.length} more ${miss.length === 1 ? 'category' : 'categories'} (highlighted in red).`);
      document.getElementById(miss[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setError('');
    setConfirming(true);
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: sel }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      setConfirming(false);
      setSuccess(true);
      setView('results');
      await loadResults();
      window.scrollTo({ top: 0 });
    } catch (e) {
      setConfirming(false);
      setError(e.message || 'Could not save your votes. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const voteAgain = () => {
    setSel({}); setMissing([]); setSuccess(false); setError('');
    setView('vote');
    window.scrollTo({ top: 0 });
  };

  const goto = (v) => { setView(v); window.scrollTo({ top: 0 }); };

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <button className={`tab ${view === 'vote' ? 'on' : ''}`} onClick={() => goto('vote')}>Vote</button>
          <button className={`tab ${view === 'results' ? 'on' : ''}`} onClick={() => goto('results')}>Live results</button>
        </div>
      </nav>

      <main className="wrap">
        <header className="hero">
          <h1><span>VIDA LOCA</span> OSCARS</h1>
          <p className="sub">THE NOMINATIONS ARE IN. IT&apos;S TIME TO VOTE.</p>
          <p className="welcome">
            {view === 'vote'
              ? 'Welcome! Pick one nominee in every category, then hit the button at the very bottom. You can vote as many times as you like.'
              : 'Every vote counts. These results update automatically.'}
          </p>
        </header>

        {view === 'vote' && (
          <>
            {CATEGORIES.map((cat) => (
              <section key={cat.id} id={cat.id} className={`cat ${missing.includes(cat.id) ? 'missing' : ''}`}>
                <h2 className="label" style={{ margin: 0 }}>{cat.title}</h2>
                <div className="opts" role="radiogroup" aria-label={cat.title}>
                  {cat.nominees.map((n) => (
                    <label key={n.id} className={`opt ${sel[cat.id] === n.id ? 'picked' : ''}`}>
                      <input type="radio" name={cat.id} value={n.id} checked={sel[cat.id] === n.id} onChange={() => choose(cat.id, n.id)} />
                      <span className="dot" aria-hidden="true" />
                      <span dir="auto">{n.name}</span>
                    </label>
                  ))}
                </div>
                {missing.includes(cat.id) && <p className="warn">Please choose one nominee here.</p>}
              </section>
            ))}

            <div className="submit-area">
              {error && <p className="err">{error}</p>}
              <button className="big" onClick={trySubmit}>SUBMIT MY VOTES</button>
            </div>
          </>
        )}

        {view === 'results' && (
          <>
            {success && (
              <div className="banner">
                Thank you! Your votes have been saved.
                <div><button className="btn" onClick={voteAgain}>Vote again</button></div>
              </div>
            )}
            {resError && <p className="err" style={{ textAlign: 'center' }}>{resError}</p>}
            {!results && !resError && <p className="meta">Loading results…</p>}
            {results && (
              <>
                <p className="meta"><b>{results.total}</b> {results.total === 1 ? 'submission' : 'submissions'} so far</p>
                {CATEGORIES.map((cat) => {
                  const c = results.counts[cat.id] || {};
                  const total = cat.nominees.reduce((s, n) => s + (c[n.id] || 0), 0);
                  const max = Math.max(0, ...cat.nominees.map((n) => c[n.id] || 0));
                  const leaders = max > 0 ? cat.nominees.filter((n) => (c[n.id] || 0) === max) : [];
                  const tied = leaders.length > 1;
                  return (
                    <section key={cat.id} className="res">
                      <h2 className="label" style={{ margin: 0 }}>{cat.title}</h2>
                      {cat.nominees.map((n) => {
                        const v = c[n.id] || 0;
                        const pct = total ? (v / total) * 100 : 0;
                        const lead = leaders.includes(n);
                        return (
                          <div key={n.id} className={`row ${lead ? 'lead' : ''}`}>
                            <div className="top">
                              <span className="name" dir="auto">{n.name}</span>
                              {lead && <span className="tag">{tied ? 'TIED' : 'LEADER'}</span>}
                              <span className="n">{v} {v === 1 ? 'vote' : 'votes'} · {Math.round(pct)}%</span>
                            </div>
                            <div className="bar"><i style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                      <p className="catv">{total} {total === 1 ? 'vote' : 'votes'} in this category</p>
                    </section>
                  );
                })}
                <div className="submit-area">
                  <button className="big" onClick={voteAgain}>BACK TO VOTING</button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {confirming && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Submit your votes?</h2>
            <p>You picked a nominee in all {CATEGORIES.length} categories. Once submitted, your votes are saved as a new entry.</p>
            <div className="row">
              <button className="btn ghost" onClick={() => setConfirming(false)} disabled={busy}>Go back</button>
              <button className="btn" onClick={confirm} disabled={busy}>{busy ? 'Saving…' : 'Yes, submit'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
