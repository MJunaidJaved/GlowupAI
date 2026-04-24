import React from 'react';
import SelectionCard from './SelectionCard';

const skinTypes = [
  { id: 'oily',        title: 'Oily',        description: 'Shiny, enlarged pores, prone to breakouts' },
  { id: 'dry',         title: 'Dry',         description: 'Tight, flaky, sometimes rough or dull' },
  { id: 'combination', title: 'Combination', description: 'Oily T-zone, dry cheeks' },
  { id: 'sensitive',   title: 'Sensitive',   description: 'Reacts easily, redness, irritation-prone' },
];

export default function StepSkinType({ value, onChange }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-jost font-medium uppercase mb-3" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
          Your Skin
        </p>
        <h2 className="font-cormorant font-semibold mb-2" style={{ fontSize: 34, color: '#1A1F1A' }}>
          Skin type?
        </h2>
        <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C' }}>Choose the one that best describes your skin</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skinTypes.map((type) => (
          <SelectionCard
            key={type.id}
            title={type.title}
            description={type.description}
            selected={value === type.id}
            onClick={() => onChange(type.id)}
          />
        ))}
      </div>
    </div>
  );
}