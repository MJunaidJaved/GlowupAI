import React from 'react';
import SelectionCard from './SelectionCard';

const goals = [
  { id: 'clear_skin',  title: 'Clear Skin'   },
  { id: 'glass_skin',  title: 'Glass Glow'   },
  { id: 'anti_aging',  title: 'Anti-Aging'   },
  { id: 'even_tone',   title: 'Even Tone'    },
  { id: 'hydrated',    title: 'Hydrated'     },
  { id: 'natural',     title: 'Minimal'      },
];

export default function StepGoals({ value, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-jost font-medium uppercase mb-3" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
          Your Goal
        </p>
        <h2 className="font-cormorant font-semibold mb-2" style={{ fontSize: 34, color: '#1A1F1A' }}>
          Main glow goal?
        </h2>
        <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C' }}>Choose the one that inspires you most</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {goals.map((g) => (
          <SelectionCard
            key={g.id}
            title={g.title}
            selected={value === g.id}
            onClick={() => onChange(g.id)}
          />
        ))}
      </div>
    </div>
  );
}