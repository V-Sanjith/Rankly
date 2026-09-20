import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { 
  Shield, Target, Users, Zap,
  ChevronDown, ArrowRight, CheckCircle, Search
} from 'lucide-react';
import Button from '../../components/ui/Button';

const FAQS = [
  {
    question: "What is Rankly?",
    answer: "Rankly is a premium project discovery platform where creators can showcase their work and use our transparent bidding system to gain better visibility and reach their target audience."
  },
  {
    question: "How does the bidding system work?",
    answer: "Projects are ranked on our leaderboard based on their bid amount. You place a bid (minimum ₹199), and if it's higher than others in your category, your project moves up the ranks, getting more visibility."
  },
  {
    question: "Is there a recurring fee?",
    answer: "No, there are no subscriptions. You only pay the one-time bid amount you choose. You can always increase your bid later if you want to climb higher."
  },
  {
    question: "Are all projects accepted?",
    answer: "We maintain a high-quality standard. All submitted projects undergo a quick review process to ensure they are functional and relevant before they appear on the live leaderboard."
  }
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text pt-20">
      {/* 1. HERO */}
      <section className="py-20 md:py-28 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-40 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">About <span className="text-primary">Rankly</span></h1>
            <p className="text-xl text-text-muted leading-relaxed">
              Our mission is to help great products find their audience. We provide a transparent, merit-driven platform where visibility is directly tied to your belief in your project.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (Detailed) */}
      <section className="py-16 bg-surface/50" id="rules">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Rankly Works & Rules</h2>
            <p className="text-text-muted">A clear, straightforward path to gaining early adopters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: '1. Discovery', desc: 'Users browse our categorized leaderboards to find the newest and best tools.' },
              { icon: Zap, title: '2. Bidding', desc: 'Creators place a one-time bid. The higher the bid, the higher the rank.' },
              { icon: Target, title: '3. Growth', desc: 'Higher ranks mean more clicks, more signups, and faster growth for your product.' }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-elevated border border-border rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRUST & TRANSPARENCY */}
      <section className="py-20 md:py-28" id="transparency">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Transparency is our core feature</h2>
              <p className="text-text-muted mb-8 text-lg">
                Unlike obscure algorithms or pay-to-play review sites, Rankly's leaderboard is completely objective. You see exactly what everyone paid, and you know exactly what it takes to beat them.
              </p>
              <ul className="space-y-4">
                {[
                  '100% transparent bidding amounts',
                  'Secure, one-time payments via Razorpay',
                  'Strict quality moderation for all listings',
                  'Real-time rank updates'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-text-muted">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-elevated border border-border rounded-2xl p-8 shadow-xl">
                <Shield className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Our Commitment</h3>
                <p className="text-text-muted leading-relaxed">
                  We promise to never manipulate rankings, hide costs, or charge hidden recurring fees. What you see on the leaderboard is exactly what it is. Fair competition for makers who believe in their products.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. TEAM */}
      <section className="py-20 bg-surface/50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Users className="w-12 h-12 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">The Team</h2>
          <p className="text-xl text-text-muted italic max-w-2xl mx-auto">
            "Founded by makers who believe great projects deserve discovery. We built Rankly because we were tired of launching into the void and wanted a predictable way to get our projects seen."
          </p>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-20 md:py-28" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-elevated border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-text-muted border-t border-border/50 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to rank your project?</h2>
        <Button as={Link} to="/register" variant="primary" size="lg" className="rounded-full">
          Get Started Today <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>
    </div>
  );
}
