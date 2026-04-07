'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  {
    id: 'daw',
    question: "What DAW do you use?",
    type: 'choice',
    options: ['FL Studio', 'Ableton Live', 'Logic Pro', 'Pro Tools', 'Other'],
  },
  {
    id: 'plugins',
    question: "Which synths/plugins do you use most?",
    type: 'multi',
    options: ['Serum', 'Vital', 'Sylenth1', 'Massive', 'Omnisphere', 'Other'],
  },
  {
    id: 'file_types',
    question: "What types of files do you download most?",
    type: 'multi',
    options: ['Stems & Loops', 'One-shots', 'MIDI files', 'Presets', 'Sample Packs'],
  },
  {
    id: 'structure',
    question: "How do you want files organized?",
    type: 'choice',
    options: [
      'By Category + Key (Bass/Am/file.wav)',
      'By Category Only (Bass/file.wav)',
      'By Plugin (Serum/Bass/file.wav)',
      'Flat — just sort by category',
    ],
  },
  {
    id: 'email',
    question: "Last step — what's your email?",
    type: 'input',
    placeholder: 'you@example.com',
  },
];

const BACKEND = 'https://web-production-a92d.up.railway.app';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  function selectChoice(val) {
    setAnswers({ ...answers, [current.id]: val });
  }

  function toggleMulti(val) {
    const prev = answers[current.id] || [];
    const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
    setAnswers({ ...answers, [current.id]: next });
  }

  function canContinue() {
    if (current.type === 'input') return inputVal.includes('@');
    if (current.type === 'multi') return (answers[current.id] || []).length > 0;
    return !!answers[current.id];
  }

  async function handleNext() {
    if (current.type === 'input') {
      setAnswers({ ...answers, [current.id]: inputVal });
    }
    if (isLast) {
      await handleSubmit();
    } else {
      setStep(step + 1);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    const finalAnswers = { ...answers, email: inputVal };
    try {
      const res = await fetch(`${BACKEND}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalAnswers.email }),
      });
      const data = await res.json();
      localStorage.setItem('sortdrop_user_id', data.user_id);
      localStorage.setItem('sortdrop_answers', JSON.stringify(finalAnswers));
      router.push('/dashboard');
    } catch (e) {
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0D0B1E',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>↓</div>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '0.05em' }}>SORTDROP</span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 560, marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Step {step + 1} of {QUESTIONS.length}</span>
          <span style={{ fontSize: 13, color: '#A855F7' }}>{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
          <div style={{
            height: 4,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #A855F7, #7C3AED)',
            width: `${((step + 1) / QUESTIONS.length) * 100}%`,
            transition: 'width 0.3s ease',
          }}/>
        </div>
      </div>

      {/* Question card */}
      <div style={{
        width: '100%', maxWidth: 560,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 20, padding: 40,
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>{current.question}</h2>

        {current.type === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {current.options.map(opt => (
              <button key={opt} onClick={() => selectChoice(opt)} style={{
                padding: '14px 20px', borderRadius: 10, textAlign: 'left',
                background: answers[current.id] === opt ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${answers[current.id] === opt ? '#A855F7' : 'rgba(255,255,255,0.1)'}`,
                color: 'white', fontSize: 15, cursor: 'pointer',
              }}>{opt}</button>
            ))}
          </div>
        )}

        {current.type === 'multi' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {current.options.map(opt => {
              const selected = (answers[current.id] || []).includes(opt);
              return (
                <button key={opt} onClick={() => toggleMulti(opt)} style={{
                  padding: '10px 18px', borderRadius: 20,
                  background: selected ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selected ? '#A855F7' : 'rgba(255,255,255,0.1)'}`,
                  color: 'white', fontSize: 14, cursor: 'pointer',
                }}>{opt}</button>
              );
            })}
          </div>
        )}

        {current.type === 'input' && (
          <input
            type="email"
            placeholder={current.placeholder}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: 10, color: 'white', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        )}

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!canContinue() || loading}
          style={{
            marginTop: 32, width: '100%', padding: '14px',
            background: canContinue() ? 'linear-gradient(135deg, #A855F7, #7C3AED)' : 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: 10,
            color: 'white', fontSize: 15, fontWeight: 600,
            cursor: canContinue() ? 'pointer' : 'not-allowed',
          }}>
          {loading ? 'Setting up...' : isLast ? 'Create my setup →' : 'Continue →'}
        </button>
      </div>
    </main>
  );
}