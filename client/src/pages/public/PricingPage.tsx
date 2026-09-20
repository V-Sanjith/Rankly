import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { 
  Check,  Shield, Zap, TrendingUp, ChevronDown, ArrowRight
} from 'lucide-react';
import Button from '../../components/ui/Button';

const PRICING_FAQS = [
  {
    question: "Is this a monthly subscription?",
    answer: "No. Rankly operates on a one-time payment basis. You place a bid once, and your project maintains its position based on that bid amount."
  },
  {
    question: "Can I increase my bid later?",
    answer: "Yes, you can 'top-up' your bid at any time. If another project outbids you, simply increase your total bid amount to reclaim your rank."
  },
  {
    question: "What happens if two projects bid the same amount?",
    answer: "In the event of a tie, the project that placed the bid first will be ranked higher."
  },
  {
    question: "Do you offer refunds?",
    answer: "Because visibility is delivered immediately upon placement, we generally do not offer refunds. However, if your project is rejected during our quality review, your payment will not be captured."
  }
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text pt-20">
      {/* 1. HERO */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-text-muted">
              No subscriptions, no hidden fees. Pay only for your bid. Your rank is entirely in your control.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. PRICING CARD */}
      <section className="pb-20 relative">
        <div className="max-w-lg mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-elevated border border-primary/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] pointer-events-none" />
            
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-2xl font-bold mb-2">Starting Bid</h2>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-4xl font-extrabold">₹199</span>
                <span className="text-text-muted mb-1">/ minimum</span>
              </div>
              <p className="text-sm text-text-muted">One-time payment. Top up anytime.</p>
            </div>

            <ul className="space-y-4 mb-8 relative z-10">
              {[
                'Permanent listing on Rankly',
                'Do-follow link to your website',
                'Detailed analytics dashboard',
                'Compete in category leaderboards',
                'Feature updates & announcements'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button as={Link} to="/register" variant="primary" className="w-full py-4 text-base rounded-xl font-bold">
              Submit Your Project
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 3. HOW BIDDING WORKS */}
      <section className="py-20 bg-surface/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Bidding Works</h2>
            <p className="text-text-muted">It's a straightforward auction system for visibility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-bg border border-border rounded-2xl p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-elevated rounded-full border border-border flex items-center justify-center font-bold text-primary shadow-md">1</div>
              <Zap className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-lg font-bold mb-2">Place Your Bid</h3>
              <p className="text-sm text-text-muted">Submit your project and enter your bid amount (min ₹199). Your bid determines your initial rank.</p>
            </div>
            
            <div className="bg-bg border border-border rounded-2xl p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-elevated rounded-full border border-border flex items-center justify-center font-bold text-primary shadow-md">2</div>
              <TrendingUp className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-lg font-bold mb-2">Climb the Ranks</h3>
              <p className="text-sm text-text-muted">Outbid competitors in your category. If Project A bids ₹500 and you bid ₹600, you take the higher spot.</p>
            </div>
            
            <div className="bg-bg border border-border rounded-2xl p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-elevated rounded-full border border-border flex items-center justify-center font-bold text-primary shadow-md">3</div>
              <Shield className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-lg font-bold mb-2">Maintain Position</h3>
              <p className="text-sm text-text-muted">If someone outbids you, you'll be notified. You can simply add to your existing bid to reclaim your spot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pricing FAQ</h2>
          </div>
          
          <div className="space-y-4">
            {PRICING_FAQS.map((faq, idx) => (
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

      {/* 5. CTA */}
      <section className="py-20 bg-primary/5 text-center border-t border-border">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Don't let your project sit in the dark</h2>
        <p className="text-text-muted mb-8 max-w-xl mx-auto">Join the transparent leaderboard and get the visibility you deserve.</p>
        <Button as={Link} to="/register" variant="primary" size="lg" className="rounded-full">
          Launch Your Project <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>
    </div>
  );
}
