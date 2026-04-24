import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, CalendarCheck, ShoppingBag, ArrowRight } from 'lucide-react';

const actions = [
  { icon: MessageCircle, title: 'Start Chat', desc: 'Talk to your AI advisor', path: '/chat' },
  { icon: CalendarCheck, title: 'View Routine', desc: 'Your AM & PM steps', path: '/routine' },
  { icon: ShoppingBag, title: 'Explore Products', desc: 'Find your perfect match', path: '/products' },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action, i) => (
        <motion.div
          key={action.path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <Link
            to={action.path}
            className="group flex items-center gap-4 p-5 bg-white rounded-3xl shadow-glow-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-peach-bg flex items-center justify-center flex-shrink-0">
              <action.icon className="w-5 h-5 text-rose-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-dm font-semibold text-warm-charcoal text-sm">{action.title}</h4>
              <p className="font-dm text-warm-gray text-xs">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-warm-gray group-hover:text-rose-gold transition-colors flex-shrink-0" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}