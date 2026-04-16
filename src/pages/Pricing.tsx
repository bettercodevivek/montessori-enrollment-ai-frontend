import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();
  const [missedCalls, setMissedCalls] = useState(8);
  const [conversionRate, setConversionRate] = useState(30);
  const [tuition, setTuition] = useState(10000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ROI Calculator calculations
  const toursMissed = Math.round(missedCalls * (conversionRate / 100));
  const revenueRisk = Math.round(toursMissed * 0.4 * tuition);
  const bbCost = 245 * 12;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      tier: 'Starter',
      tagline: 'Stop missing calls',
      price: 195,
      originalSetup: 299,
      bestFor: 'Best for schools losing inquiries to voicemail and wanting an immediate safety net with no extra staff burden.',
      featured: false,
      features: [
        'Answers every new parent call during class, lunch rush, and after hours',
        'Shares school info: hours, programs, age groups',
        'Captures parent name and phone number',
        'Collects preferred tour date and time',
        'Call summary emailed to director after every call',
        'English language support',
        '250 minutes included per month enough for ~50 calls at average length'
      ],
      tourBooking: 'Parent requests a preferred time your staff confirms and books manually.',
      minutes: 250
    },
    {
      tier: 'Growth',
      tagline: 'GROWTH: Capture and schedule',
      price: 245,
      originalSetup: 399,
      bestFor: 'Best for schools ready to convert more inquiries into confirmed tours without adding staff hours or manual back-and-forth.',
      featured: true,
      features: [
        'Real-time calendar integration (Google or Outlook)',
        'Nora books tours live during the call instant confirmation to parent',
        'Full parent profile: name, phone, email, child name and age',
        'Bilingual support English and Spanish',
        'Higher-conversion conversation flow tuned for childcare',
        '500 minutes included per month enough for ~100 calls at average length'
      ],
      tourBooking: 'Nora books directly on your calendar during the call. Parent receives instant confirmation before they hang up.',
      minutes: 500
    },
    {
      tier: 'Pro',
      tagline: 'Full enrollment system',
      price: 290,
      originalSetup: 599,
      bestFor: 'Best for schools that want a managed, consistent enrollment process with visibility into performance and zero dropped leads.',
      featured: false,
      features: [
        'After-hours and weekend call coverage, every day',
        'Priority alerts for high-intent families director notified immediately',
        'Advanced call summaries with key parent insights and questions asked',
        'Printable tour day one-pager for staff personalized per family',
        'Director dashboard calls received, tours booked, follow-ups needed',
        'Automated email reminders sent to parent before each tour',
        'Ongoing AI tuning as your programs, staff, or availability changes',
        'Multi-location support available',
        '750 minutes included per month enough for ~150 calls at average length'
      ],
      tourBooking: 'Nora books directly, sends confirmation, and triggers automated reminders before the tour date. Zero no-shows go unaddressed.',
      minutes: 750
    }
  ];

  const faqs = [
    {
      q: 'What if Nora says something wrong to a parent?',
      a: 'Nora is trained specifically on your school\'s programs, hours, age groups, and FAQs before she handles a single live call. She only answers what she knows if a parent asks something outside her knowledge, she lets them know a team member will follow up promptly. You review and approve her responses during onboarding before going live.'
    },
    {
      q: 'How long does setup take?',
      a: 'Most schools are live within 5-7 business days. Onboarding includes a configuration session where we set up Nora with your specific information, a test call for your team to hear her in action, and director sign-off before she handles any real inquiries.'
    },
    {
      q: 'Is there a contract or long-term commitment?',
      a: 'No long-term contract required. All plans are month-to-month. We also offer a discounted annual rate for schools that want to lock in their pricing ask about it during your discovery call.'
    },
    {
      q: 'What about calls from current families or staff?',
      a: 'Nora is specifically designed to handle new parent inquiries only. Calls from existing families and internal staff are routed separately we configure this clearly during onboarding so there is no confusion and nothing gets mixed up.'
    },
    {
      q: 'How many calls can Nora handle is there a limit?',
      a: 'Each plan includes a monthly minute allowance 250 minutes on Starter, 500 on Growth, and 750 on Pro. Minutes are billed by actual usage, so a 3-minute call uses 3 minutes and a 6-minute call uses 6. Unused included minutes roll over to the next month. If your school goes over your balance before the next renewal, you can purchase a top-up or additional usage is billed at $1.50 per 5-minute block. Unlike a staff member, Nora can handle multiple simultaneous calls with no hold times and no voicemail.'
    },
    {
      q: 'Do you offer pricing for multiple locations?',
      a: 'Yes. If you operate more than one Kids R Kids location, contact us for multi-location pricing. Schools on the same account receive a meaningful discount, and the Pro plan is built to support multi-location visibility from a single dashboard.'
    }
  ];

  const comparisonData = [
    { category: 'Core', features: [
      { name: '24/7 call answering', starter: true, growth: true, pro: true },
      { name: 'Minutes included / month', starter: '250 min', growth: '500 min', pro: '750 min' },
      { name: 'Overage rate', starter: '$1.50 / 5-min block', growth: '$1.50 / 5-min block', pro: '$1.50 / 5-min block' },
      { name: 'School info & FAQ responses', starter: true, growth: true, pro: true },
      { name: 'Director summary email', starter: true, growth: true, pro: true }
    ]},
    { category: 'Parent capture & booking', features: [
      { name: 'Name & phone capture', starter: true, growth: true, pro: true },
      { name: 'Full profile (email, child name, age)', starter: false, growth: true, pro: true },
      { name: 'Live calendar tour booking', starter: false, growth: true, pro: true },
      { name: 'Instant tour confirmation to parent', starter: false, growth: true, pro: true },
      { name: 'Spanish language support', starter: false, growth: true, pro: true }
    ]},
    { category: 'Advanced & automation', features: [
      { name: 'After-hours & weekend coverage', starter: false, growth: false, pro: true },
      { name: 'Priority alerts for high-intent families', starter: false, growth: false, pro: true },
      { name: 'Advanced call summaries & insights', starter: false, growth: false, pro: true },
      { name: 'Printable tour day one-pager', starter: false, growth: false, pro: true },
      { name: 'Director dashboard', starter: false, growth: false, pro: true },
      { name: 'Automated tour reminders', starter: false, growth: false, pro: true },
      { name: 'Ongoing AI tuning', starter: false, growth: false, pro: true },
      { name: 'Multi-location support', starter: false, growth: false, pro: true }
    ]}
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-base">BB</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              BrightBridge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero */}
        <div className="text-center py-20 max-w-4xl mx-auto px-6">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
            Built for childcare operators
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.05]">
            Every parent call is an <span className="text-blue-600">enrollment opportunity</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            BrightBridge answers every new parent inquiry professionally, instantly, in any language so your team can focus on the children already in your care.
          </p>
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm font-medium">
              <strong>Founding partner offer:</strong> Setup & onboarding fee waived for the first 10 Kids R Kids schools. No contracts. Cancel anytime.
            </span>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-slate-900 mb-2">See what missed calls are costing you</h2>
              <p className="text-slate-600">Adjust the sliders to match your school the math updates in real time.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <label className="block text-sm text-slate-600 mb-4">Calls per month missed or sent to voicemail</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={missedCalls}
                  onChange={(e) => setMissedCalls(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-lg font-semibold text-slate-900 mt-2">{missedCalls} calls / month</div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-600 mb-4">% of those parents who would have toured</label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-lg font-semibold text-slate-900 mt-2">{conversionRate}%</div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-600 mb-4">Average annual tuition per child</label>
                <input
                  type="range"
                  min="5000"
                  max="20000"
                  step="500"
                  value={tuition}
                  onChange={(e) => setTuition(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-lg font-semibold text-slate-900 mt-2">${tuition.toLocaleString()} / year</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="text-xs text-slate-400 mb-2">Potential tours missed per month</div>
                <div className="text-3xl font-serif text-slate-900">{toursMissed}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="text-xs text-slate-400 mb-2">Annual tuition revenue at risk</div>
                <div className="text-3xl font-serif text-green-600">${revenueRisk.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="text-xs text-slate-400 mb-2">BrightBridge Growth plan / year</div>
                <div className="text-3xl font-serif text-slate-900">${bbCost.toLocaleString()}</div>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 text-right mt-4">Estimates assume 40% of toured families enroll. Actual results will vary.</p>
          </div>
        </div>

        {/* Impact Math */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-slate-900 rounded-2xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-24 translate-x-24"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">The math is simple</div>
              <h2 className="text-4xl md:text-5xl font-serif mb-4">One enrolled child pays for<br />this system for the entire year.</h2>
              <p className="text-slate-400 mb-8 max-w-2xl">Every missed call is a family that enrolled somewhere else. BrightBridge makes sure that family gets a real answer and you get the tour.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-8">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Avg annual tuition</div>
                  <div className="text-xl md:text-2xl font-serif text-white mb-1">$11,000</div>
                  <div className="text-xs text-slate-600">per enrolled child</div>
                </div>
                <div className="bg-white/5 p-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-xs text-slate-600">1 captured<br />inquiry</div>
                  </div>
                </div>
                <div className="bg-white/5 p-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-xs text-slate-600">1 tour booked<br />& enrolled</div>
                  </div>
                </div>
                <div className="bg-green-600/20 border border-green-600/40 rounded-lg p-4">
                  <div className="text-xs text-green-300 uppercase tracking-wider mb-2">You keep</div>
                  <div className="text-xl md:text-2xl font-serif text-green-400 mb-1">$11,000</div>
                  <div className="text-xs text-green-400">vs $245/mo plan cost</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="border-t-2 border-blue-600 pt-4">
                  <div className="text-3xl font-serif text-white mb-2">4.5×</div>
                  <div className="text-sm text-slate-400">Return on investment from a single enrollment at $245/mo Growth plan</div>
                </div>
                <div className="border-t-2 border-blue-600 pt-4">
                  <div className="text-3xl font-serif text-white mb-2">24/7</div>
                  <div className="text-sm text-slate-400">Nora answers every call during class, lunch rush, pickup, and weekends</div>
                </div>
                <div className="border-t-2 border-blue-600 pt-4">
                  <div className="text-3xl font-serif text-white mb-2">$0</div>
                  <div className="text-sm text-slate-400">Additional staff cost. Nora handles every new parent inquiry automatically</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-4 max-w-2xl">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-400 leading-relaxed">
                  Most childcare directors tell us they miss 5-10 parent calls a week during peak hours. At a 30% tour conversion rate and 40% enrollment close rate, that's <strong className="text-white">1-2 missed enrollments every month</strong> or up to $24,000 in annual tuition walking out the door.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-600">No hidden fees. No long-term contracts. Minutes included per plan overage billed at $1.50 per additional 5-minute block.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white border rounded-2xl overflow-hidden flex flex-col ${plan.featured ? 'border-2 border-blue-400 relative' : 'border-slate-200'}`}>
                {plan.featured && (
                  <div className="bg-blue-600 text-white text-center text-xs font-bold py-2">
                    Most popular · Recommended
                  </div>
                )}
                
                <div className="p-8 border-b border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{plan.tier}</div>
                  <h3 className="text-xl font-serif text-slate-900 mb-4">{plan.tagline}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-serif text-slate-900">${plan.price}</span>
                    <span className="text-slate-400">/ month</span>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-slate-400 mb-1">One-time onboarding</div>
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-2">${plan.originalSetup}</span>
                      <span className="text-xs text-green-600 font-semibold">Waived for founding partners</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 leading-relaxed">
                    {plan.bestFor}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">What Nora handles</div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                        <div className="w-4 h-4 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <span dangerouslySetInnerHTML={{ __html: feature.replace(/strong>/g, 'strong className="font-semibold text-slate-900">') }} />
                      </li>
                    ))}
                    {Array(Math.max(...plans.map(p => p.features.length)) - plan.features.length).fill(null).map((_, i) => (
                      <li key={`empty-${i}`} className="flex gap-3 text-sm text-slate-700 leading-relaxed opacity-0">
                        <div className="w-4 h-4 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <span>&nbsp;</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Tour booking</div>
                    <div className="text-sm text-blue-800 leading-relaxed">{plan.tourBooking}</div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    Additional minutes billed at $1.50 per 5-minute block. Included minutes roll over month to month.
                  </div>
                </div>

                <div className="p-8 border-t border-slate-200">
                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full py-3 rounded-lg font-semibold text-center transition-colors ${
                      plan.featured 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Get started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
            <h2 className="text-2xl font-serif text-slate-900 mb-2">What's included at a glance</h2>
            <p className="text-slate-600 mb-8">Minutes are billed by the minute: a 3-minute call uses 3 minutes, a 6-minute call uses 6. Unused minutes roll over to the next billing cycle.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">Feature</th>
                    <th className="text-center p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">Starter<br /><span className="font-normal normal-case">$195/mo</span></th>
                    <th className="text-center p-3 text-xs font-bold text-blue-600 uppercase tracking-wider border-b border-slate-200">Growth<br /><span className="font-normal normal-case text-blue-600">$245/mo</span></th>
                    <th className="text-center p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">Pro<br /><span className="font-normal normal-case">$290/mo</span></th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((category, catIndex) => (
                    <React.Fragment key={catIndex}>
                      <tr>
                        <td colSpan={4} className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">{category.category}</td>
                      </tr>
                      {category.features.map((feature, featureIndex) => (
                        <tr key={featureIndex} className="hover:bg-white/60">
                          <td className="p-3 text-sm text-slate-800 border-b border-slate-100">{feature.name}</td>
                          <td className="p-3 text-center border-b border-slate-100">
                            {typeof feature.starter === 'boolean' ? (
                              <div className={`w-2.5 h-2.5 rounded-full mx-auto ${feature.starter ? 'bg-green-600' : 'bg-slate-200'}`}></div>
                            ) : (
                              <span className="text-sm text-slate-800">{feature.starter}</span>
                            )}
                          </td>
                          <td className="p-3 text-center border-b border-slate-100">
                            {typeof feature.growth === 'boolean' ? (
                              <div className={`w-2.5 h-2.5 rounded-full mx-auto ${feature.growth ? 'bg-green-600' : 'bg-slate-200'}`}></div>
                            ) : (
                              <span className="text-sm text-slate-800">{feature.growth}</span>
                            )}
                          </td>
                          <td className="p-3 text-center border-b border-slate-100">
                            {typeof feature.pro === 'boolean' ? (
                              <div className={`w-2.5 h-2.5 rounded-full mx-auto ${feature.pro ? 'bg-green-600' : 'bg-slate-200'}`}></div>
                            ) : (
                              <span className="text-sm text-slate-800">{feature.pro}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif text-slate-900 mb-4">Common questions</h2>
            <p className="text-slate-600">Everything you need to know before getting started.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    openFaq === index ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {openFaq === index ? '-' : '+'}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-slate-900 rounded-2xl p-12 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">See it live</div>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Hear Nora handle a real parent call</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              We'll walk you through a 15-minute demo and show you exactly what a parent experiences from first ring to tour confirmation.
            </p>
            <a
              href="mailto:info@brightbridge.ai"
              className="inline-block bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Book a 15-minute demo
            </a>
            <p className="text-slate-600 text-sm mt-4">No commitment. Setup fee waived for first 10 founding partner schools.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 text-center text-sm text-slate-400">
        © 2026 BrightBridge. All rights reserved. · Built for childcare operators.
      </footer>
    </div>
  );
};

export default Pricing;
