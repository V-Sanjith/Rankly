import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  Globe, Brain, Code2, Smartphone, Rocket, ShoppingCart, 
  Palette, Layers, ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  { 
    name: 'SaaS', 
    icon: Globe, 
    value: 'SaaS',
    description: 'Software as a Service products solving business and consumer problems.'
  },
  { 
    name: 'AI Tools', 
    icon: Brain, 
    value: 'AI Tools',
    description: 'Generative AI, machine learning wrappers, and intelligent automation.'
  },
  { 
    name: 'Developer Tools', 
    icon: Code2, 
    value: 'Developer Tools',
    description: 'APIs, frameworks, IDEs, and tools to help developers ship faster.'
  },
  { 
    name: 'Mobile Apps', 
    icon: Smartphone, 
    value: 'Mobile Apps',
    description: 'iOS and Android applications across all categories.'
  },
  { 
    name: 'Startups', 
    icon: Rocket, 
    value: 'Startups',
    description: 'Early-stage companies and ambitious new ventures.'
  },
  { 
    name: 'E-commerce', 
    icon: ShoppingCart, 
    value: 'E-commerce',
    description: 'Online stores, D2C brands, and commerce infrastructure.'
  },
  { 
    name: 'Personal Projects', 
    icon: Palette, 
    value: 'Personal Projects',
    description: 'Side hustles, portfolios, and passion projects by indie makers.'
  },
  { 
    name: 'Other', 
    icon: Layers, 
    value: 'Other',
    description: 'Everything else that doesn\'t fit neatly into a box.'
  }
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Explore Categories</h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Browse top-ranking projects across various domains and find the perfect tools for your needs.
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={`/explore?category=${encodeURIComponent(cat.value)}`}
                className="block h-full"
              >
                <div className="glass-card rounded-2xl p-6 h-full flex flex-col group hover:border-primary/50 hover:bg-surface/80 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Subtle Hover Gradient */}
                  <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-border/50">
                      <cat.icon className="w-7 h-7 text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex-grow">
                    <h2 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">{cat.name}</h2>
                    <p className="text-sm text-text-muted mb-6 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center text-sm font-medium text-text-muted group-hover:text-primary transition-colors relative z-10">
                    Explore Rankings <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
