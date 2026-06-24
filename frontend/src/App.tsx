import { useMemo, useState } from 'react';

type Tab = 'main' | 'abc' | 'func';

type KeyDefinition = {
  label: string;
  type: 'digit' | 'operator' | 'function' | 'utility' | 'toggle' | 'action';
  value?: string;
  className?: string;
};

const baseKeys: KeyDefinition[][] = [
  [
    { label: 'a²', type: 'function', value: 'a^2' },
    { label: 'aᵇ', type: 'function', value: 'a^b' },
    { label: '|a|', type: 'function', value: 'abs(' },
    { label: '7', type: 'digit', value: '7' },
    { label: '8', type: 'digit', value: '8' },
    { label: '9', type: 'digit', value: '9' },
    { label: '÷', type: 'operator', value: '/' },
    { label: '%', type: 'function', value: '%' },
  ],
  [
    { label: '√', type: 'function', value: 'sqrt(' },
    { label: 'ⁿ√', type: 'function', value: 'root(' },
    { label: 'π', type: 'function', value: 'π' },
    { label: '4', type: 'digit', value: '4' },
    { label: '5', type: 'digit', value: '5' },
    { label: '6', type: 'digit', value: '6' },
    { label: '×', type: 'operator', value: '*' },
    { label: 'a/b', type: 'function', value: '/' },
  ],
  [
    { label: 'sin', type: 'function', value: 'sin(' },
    { label: 'cos', type: 'function', value: 'cos(' },
    { label: 'tan', type: 'function', value: 'tan(' },
    { label: '1', type: 'digit', value: '1' },
    { label: '2', type: 'digit', value: '2' },
    { label: '3', type: 'digit', value: '3' },
    { label: '−', type: 'operator', value: '-' },
    { label: '<', type: 'function', value: '(' },
    { label: '>', type: 'function', value: ')' },
  ],
  [
    { label: '(', type: 'function', value: '(' },
    { label: ')', type: 'function', value: ')' },
    { label: ',', type: 'function', value: ',' },
    { label: '0', type: 'digit', value: '0' },
    { label: '.', type: 'digit', value: '.' },
    { label: '+', type: 'operator', value: '+' },
    { label: '⌫', type: 'utility', value: 'backspace' },
    { label: '=', type: 'action', value: '=' },
  ],
];

const tabOptions: { id: Tab; label: string }[] = [
  { id: 'main', label: 'main' },
  { id: 'abc', label: 'abc' },
  { id: 'func', label: 'func' },
];

function App() {
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [history, setHistory] = useState<string[]>([]);

  const displayValue = useMemo(() => (answer ? `${expression}\n= ${answer}` : expression), [expression, answer]);
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  const insertValue = (value: string) => {
    if (value === 'backspace') {
      setExpression((prev) => prev.slice(0, -1));
      setAnswer('');
      return;
    }

    if (value === '=') {
      evaluate();
      return;
    }

    if (value === 'CLR') {
      setExpression('');
      setAnswer('');
      return;
    }

    if (value === 'π') {
      setExpression((prev) => prev + 'π');
      setAnswer('');
      return;
    }

    setExpression((prev) => prev + value);
    setAnswer('');
  };

  const evaluate = async () => {
    const trimmed = expression.trim();
    if (!trimmed) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: trimmed, angle_mode: angleMode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Unable to calculate');
      }
      setAnswer(String(data.result));
      setHistory((prev) => [trimmed, ...prev].slice(0, 10));
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4 text-mocha sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[28px] border border-[#C8AA87] bg-[#FDF8ED] p-4 shadow-[0_20px_60px_rgba(74,47,36,0.14)] sm:p-6">
        <header className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-[0.3em] text-mocha sm:text-5xl">Yusroh</h1>
        </header>

        <section className="rounded-[22px] border border-[#B78D5D] bg-[#FCF4E7] p-4 shadow-inner">
          <div className="mb-3 flex items-center justify-between text-sm text-[#7D5A3C]">
            <span className="rounded-full bg-[#E8D9C0] px-3 py-1">{activeTab}</span>
            <button
              className="rounded-full border border-[#B78D5D] px-3 py-1 text-sm"
              onClick={() => setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'))}
            >
              {angleMode.toUpperCase()}
            </button>
          </div>
          <div className="min-h-[120px] rounded-[18px] border border-[#8B5E3C] bg-[#FFFDF8] p-4 text-right text-2xl font-semibold leading-relaxed text-[#4A2F24] sm:text-3xl">
            <div className="whitespace-pre-wrap break-words">{displayValue || '0'}</div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-[#E2C9A5] bg-[#F6EBDD] p-2">
          <div className="flex gap-2">
            {tabOptions.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3 py-2 text-sm ${activeTab === tab.id ? 'bg-[#7A4E2A] text-[#FFF8EE]' : 'bg-[#FDF8ED] text-[#6F4E37]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-[#C8AA87] bg-[#FDF8ED] p-2 text-lg">↺</button>
            <button className="rounded-full border border-[#C8AA87] bg-[#FDF8ED] p-2 text-lg">↻</button>
            <button className="rounded-full border border-[#C8AA87] bg-[#FDF8ED] px-3 py-2 text-sm" onClick={() => insertValue('CLR')}>
              CLR
            </button>
            <button className="rounded-full border border-[#C8AA87] bg-[#FDF8ED] p-2 text-lg">⚙</button>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {baseKeys.flat().map((key, index) => {
            const common = 'flex h-12 w-full items-center justify-center rounded-[14px] border border-[#D9C7A6] text-sm font-semibold transition hover:opacity-90 sm:h-14 sm:text-base';
            let style = 'bg-[#F7EBD8] text-[#4A2F24]';
            if (key.type === 'operator') {
              style = 'bg-[#7A4E2A] text-[#FFF8EE]';
            } else if (key.type === 'action') {
              style = 'bg-[#6F4E37] text-[#FFF8EE]';
            }

            return (
              <button
                key={`${key.label}-${index}`}
                className={`${common} ${style}`}
                onClick={() => insertValue(key.value ?? key.label)}
              >
                {key.label}
              </button>
            );
          })}
        </section>

        <section className="rounded-[18px] border border-[#E2C9A5] bg-[#F6EBDD] p-3 text-sm text-[#7D5A3C]">
          <div className="font-semibold">Recent</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {history.length === 0 ? <span>No entries yet.</span> : history.map((item, idx) => <span key={`${item}-${idx}`} className="rounded-full bg-[#FDF8ED] px-2 py-1">{item}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
