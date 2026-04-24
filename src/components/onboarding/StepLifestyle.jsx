import React from 'react';
import SelectionCard from './SelectionCard';

const waterOptions = [
  { id: 'less_than_4', title: 'Under 4 glasses' },
  { id: '4_to_6',      title: '4-6 glasses'     },
  { id: '7_plus',      title: '7+ glasses'      },
];

const sleepOptions = [
  { id: 'less_than_6', title: 'Under 6 hours' },
  { id: '6_to_7',      title: '6-7 hours'     },
  { id: '8_plus',      title: '8+ hours'      },
];

const dietOptions = [
  { id: 'junk',    title: 'Mostly junk'    },
  { id: 'mixed',   title: 'Mixed diet'     },
  { id: 'healthy', title: 'Mostly healthy' },
];

function SubSection({ heading, options, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="font-jost font-medium" style={{ fontSize: 13, color: '#5C6B5C' }}>{heading}</h3>
      <div className="grid grid-cols-3 gap-3">
        {options.map((o) => (
          <SelectionCard key={o.id} title={o.title} selected={selected === o.id} onClick={() => onSelect(o.id)} />
        ))}
      </div>
    </div>
  );
}

export default function StepLifestyle({ water, sleep, diet, onWater, onSleep, onDiet }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-jost font-medium uppercase mb-3" style={{ fontSize: 11, letterSpacing: '0.18em', color: '#9AAA9A' }}>
          Daily Habits
        </p>
        <h2 className="font-cormorant font-semibold mb-2" style={{ fontSize: 34, color: '#1A1F1A' }}>
          Your lifestyle?
        </h2>
        <p className="font-jost" style={{ fontSize: 14, color: '#5C6B5C' }}>Helps us give better recommendations</p>
      </div>
      <SubSection heading="Daily water intake" options={waterOptions} selected={water} onSelect={onWater} />
      <SubSection heading="Hours of sleep per night" options={sleepOptions} selected={sleep} onSelect={onSleep} />
      <SubSection heading="Your diet quality" options={dietOptions} selected={diet} onSelect={onDiet} />
    </div>
  );
}