import React from 'react';
import SelectionCard from './SelectionCard';

const concerns = [
  { id: 'acne',           title: 'Acne'          },
  { id: 'dark_spots',     title: 'Dark Spots'    },
  { id: 'dullness',       title: 'Dullness'      },
  { id: 'dryness',        title: 'Dryness'       },
  { id: 'oiliness',       title: 'Oiliness'      },
  { id: 'anti_aging',     title: 'Anti-Aging'    },
  { id: 'sensitivity',    title: 'Sensitivity'   },
  { id: 'uneven_texture', title: 'Texture'       },
  { id: 'dark_circles',   title: 'Dark Circles'  },
  { id: 'redness',        title: 'Redness'       },
];

export default function StepConcerns({ value, onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-jost font-medium uppercase mb-3" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
          Your Skin
        </p>
        <h2 className="font-cormorant font-semibold mb-2" style={{ fontSize: 34, color: '#1A1F1A' }}>
          Main concerns?
        </h2>
        <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C' }}>Select all that apply</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {concerns.map((c) => (
          <SelectionCard
            key={c.id}
            title={c.title}
            selected={value.includes(c.id)}
            onClick={() => toggle(c.id)}
          />
        ))}
      </div>
    </div>
  );
}