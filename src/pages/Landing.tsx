import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Globe, ArrowRight, Zap, PhoneCall, FileText,
    Clock, CheckCircle2, Languages, Calendar, Users,
    Heart, MessageSquare, LineChart, AlertCircle, BarChart3,
    Smartphone, Mail, Play, LayoutGrid
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
    <div className="flex flex-col p-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6 shrink-0 border border-blue-100">
            <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
    </div>
);

const RoadmapItem = ({ icon: Icon, title, status }: { icon: any; title: string; status?: string }) => {
    const isAvailable = status === 'Available';
    const isBeta = status === 'BETA';
    return (
        <div className={`p-6 bg-white border ${isAvailable ? 'border-blue-200 shadow-sm shadow-blue-100/50' : 'border-slate-200'} rounded-2xl group hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-300`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${isAvailable ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {status && (
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isAvailable ? 'bg-blue-100 text-blue-700' : isBeta ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {status}
                    </span>
                )}
            </div>
            <h4 className={`text-lg font-bold leading-tight transition-colors ${isAvailable ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>{title}</h4>
        </div>
    );
};

export const Landing = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
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
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#problem" className="hover:text-blue-600 transition-colors">The Problem</a>
                        <a href="#approach" className="hover:text-blue-600 transition-colors">Our Approach</a>
                        <a href="#capabilities" className="hover:text-blue-600 transition-colors">Capabilities</a>
                        <a href="#roadmap" className="hover:text-blue-600 transition-colors">Roadmap</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
                        >
                            <Globe className="w-4 h-4" />
                            {i18n.language === 'en' ? 'ESP' : 'ENG'}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-40 pb-24 md:pt-48 md:pb-32 bg-slate-50 relative">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8">
                            Built for Childcare Operators
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
                            Capture Every <span className="text-blue-600">Enrollment</span> Opportunity.
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
                            A communication platform designed for childcare centers to capture new parent inquiries, reduce front desk overload, and support diverse families.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-10 py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200/50 flex items-center justify-center gap-2"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5" />
                            </button>

                        </div>
                    </div>
                </div>
            </section>

            {/* Section 1 – The Reality */}
            <section className="py-24 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 leading-tight">The Reality Most Montessori Schools Face</h2>
                            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-normal">
                                <p>
                                    Running a school means balancing education, parent relationships, and daily operations.
                                </p>
                                <p>
                                    During busy classroom hours, phone calls often come at the worst possible time. Staff may already be helping students, assisting parents, or managing administrative tasks.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <Clock className="w-8 h-8 text-blue-600 mb-4" />
                                <h4 className="font-bold text-slate-900 mb-2">Inquiries never stop</h4>
                                <p className="text-sm text-slate-500">Calls happen during class, after hours, and on weekends when staff aren't available.</p>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
                                <h4 className="font-bold text-slate-900 mb-2">Missed families</h4>
                                <p className="text-sm text-slate-500">When calls are missed or rushed, potential families move on to other schools.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2 – The Problem */}
            <section id="problem" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">The Problem We Are Solving</h2>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-16">
                        Most Montessori schools experience similar communication challenges that quietly impact enrollment growth and parent experience.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: PhoneCall, title: "Missed Calls", text: "Enrollment inquiries are often missed during busy classroom periods." },
                            { icon: MessageSquare, title: "Inconsistent Info", text: "Staff may give different answers to the same new parent questions." },
                            { icon: Clock, title: "After-Hours Gaps", text: "New parents calling after school closes receive no immediate response." },
                            { icon: Zap, title: "Front Desk Overload", text: "Phone interruptions overwhelm staff during peak operation hours." },
                            { icon: Languages, title: "Language Barriers", text: "Non-English speaking families face hurdles when seeking information." },
                            { icon: Heart, title: "Poor First Touch", text: "A rushed or missed first call sets an unprofessional tone for your school." },
                        ].map((item, i) => (
                            <div key={i} className="text-left group cursor-default">
                                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                                    <item.icon className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 3 - Our Approach */}
            <section id="approach" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">Our Approach</h2>
                        <p className="text-xl text-slate-300 font-medium leading-relaxed mb-8">
                            We built a platform designed specifically for childcare centers to support the moment when a new family first reaches out.
                        </p>
                        <p className="text-lg text-blue-400 font-bold mb-8 italic">
                            Help schools capture opportunities while reducing operational noise.
                        </p>
                        <ul className="space-y-4 text-slate-300 font-medium">
                            <li className="flex items-center gap-3 justify-center md:justify-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                <span>Answers every new parent call calmly and consistently</span>
                            </li>
                            <li className="flex items-center gap-3 justify-center md:justify-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                <span>Allows your team to focus on students</span>
                            </li>
                            <li className="flex items-center gap-3 justify-center md:justify-start">
                                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                <span>Maintains a professional first impression 24/7</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                        <div className="text-blue-400 font-bold text-sm mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            System Methodology
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-sm font-bold mb-1">Inquiry Receipt</div>
                                <div className="text-xs text-slate-400">Caller ID and initial intent analysis</div>
                            </div>
                            <div className="p-4 rounded-xl bg-blue-600 border border-blue-500">
                                <div className="text-sm font-bold mb-1">AI Assistant Interaction</div>
                                <div className="text-xs text-blue-100">Program info & tour scheduling</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-sm font-bold mb-1">Director Notification</div>
                                <div className="text-xs text-slate-400">Instant summary & followup flag</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Offering */}
            <section id="capabilities" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mb-16 px-4 py-1.5 rounded-lg bg-blue-50 border border-blue-100 inline-block">
                        <p className="text-blue-700 font-bold text-xs uppercase tracking-widest">Current Offering</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-[1.1]">AI Enrollment Assistant</h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                A voice assistant designed to handle new parent inquiries and help families take the next step toward visiting your school.
                            </p>
                            <div className="bg-slate-50 border-l-4 border-blue-600 p-8 rounded-r-xl">
                                <p className="text-lg text-slate-800 font-bold mb-2">Designed for seamless integration</p>
                                <p className="text-slate-600">Your front desk continues to handle all existing parent calls. We handle the volume of new enrollment traffic.</p>
                            </div>

                            {/* Interactive Demo Placeholder */}
                            <div className="mt-8 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                        <Play className="w-6 h-6 text-blue-600 ml-1" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-slate-900 text-xl">Listen to Nora in Action</h4>
                                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                Active Demo
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">Hear a simulated conversation between a parent and our AI enrollment agent.</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                    <audio
                                        controls
                                        className="w-full outline-none"
                                        src="/nora-demo.mp3"
                                    >
                                        Your browser does not support the audio element.
                                    </audio>

                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FeatureCard icon={Smartphone} title="24/7 Availability" desc="Works after hours, during lunch, and on weekends." />
                            <FeatureCard icon={MessageSquare} title="Unified Messaging" desc="Consistent program information for every caller." />
                            <FeatureCard icon={Users} title="Inquiry Capture" desc="Automatically logs contact details and new parent needs." />
                            <FeatureCard icon={Calendar} title="Tour Booking" desc="Coordinates visits without manual back-and-forth." />
                            <FeatureCard icon={Mail} title="Director Summaries" desc="Sends detailed conversation logs to management." />
                            <FeatureCard icon={AlertCircle} title="Priority Flagging" desc="Identifies leads that need urgent personal attention." />
                        </div>
                    </div>
                </div>
            </section>

            {/* Multilingual Support */}
            <section className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="flex flex-col gap-4 max-w-sm">
                                <div className="flex gap-4 p-2 bg-white border border-slate-200 rounded-xl">
                                    <div className="flex-1 p-8 rounded-lg bg-blue-50 text-center border border-blue-100 group">
                                        <div className="text-2xl font-black text-blue-600 mb-2 transition-transform group-hover:scale-110">EN</div>
                                        <div className="text-[10px] uppercase font-black text-blue-400 tracking-widest">English</div>
                                    </div>
                                    <div className="flex-1 p-8 rounded-lg bg-slate-900 text-center text-white border border-slate-800 group">
                                        <div className="text-2xl font-black text-blue-500 mb-2 transition-transform group-hover:scale-110">ES</div>
                                        <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Español</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-center">
                                    <p className="text-sm font-medium text-slate-500">Additional languages as needed based on your community</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center gap-3 text-blue-600 font-bold mb-4 uppercase tracking-[0.2em] text-xs">
                                <Languages className="w-4 h-4" />
                                Global Accessibility
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">Multilingual Support</h2>
                            <p className="text-xl text-slate-600 mb-8 font-medium leading-relaxed">
                                Many Montessori communities serve families from diverse backgrounds. Our system is designed to respond to new parents in the language they feel most comfortable using.
                            </p>
                            <p className="text-slate-500 font-medium">This ensures every new parent feels welcomed and understood from the very first interaction.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section id="roadmap" className="py-24 bg-slate-50 relative border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="flex items-center gap-3 text-blue-600 font-bold mb-4 uppercase tracking-[0.2em] text-xs">
                            <LayoutGrid className="w-4 h-4" />
                            Future Outlook
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Future Platform Features</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">We are building a comprehensive toolkit for modern childcare operation. Coming in 2026.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <RoadmapItem icon={LineChart} title="New Parent Inquiry Dashboard" />
                        <RoadmapItem icon={BarChart3} title="Enrollment Pipeline Tracker" />
                        <RoadmapItem icon={Calendar} title="Tour Scheduling & Automated Reminders" />
                        <RoadmapItem icon={FileText} title="New Parent Onboarding Automation" />
                        <RoadmapItem icon={Users} title="Childcare CRM" />
                        <RoadmapItem icon={MessageSquare} title="New Parent Communication Hub" />
                        <RoadmapItem icon={Zap} title="Re-engagement Campaigns for Interested Families" />
                    </div>
                </div>
            </section>

            {/* Built for Childcare */}
            <section className="py-24 bg-slate-900 text-white border-y border-slate-800">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter">Built for Childcare Operators</h2>
                    <p className="text-xl text-slate-400 mb-12 font-medium leading-relaxed">
                        Most tools available today are built for generic businesses. This platform is engineered around the specific daily rhythm of a childcare center.
                    </p>
                    <div className="p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200 mb-4 tracking-tight">
                            "Help schools capture opportunities while reducing operational noise."
                        </p>
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">The Core Mission</p>
                    </div>
                </div>
            </section>


            {/* Early Partners & CTA */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">Early Partner Schools</h2>
                        <div className="space-y-6 text-xl text-slate-600 font-medium leading-relaxed">
                            <p>
                                We are currently working with a small group of Montessori schools to help shape the platform and ensure it solves real operational challenges.
                            </p>
                            <p>
                                These early partners help us refine the system so it works naturally within the daily rhythm of a childcare center.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">Interested in Learning More?</h2>
                        <p className="text-xl text-slate-600 mb-10 font-medium leading-relaxed">
                            If you are curious how this platform could support your school, we would be happy to walk through how it works and answer questions.
                        </p>
                        <a
                            href="https://calendly.com/ben-aifusioniqlabs/30min"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200/50"
                        >
                            <Calendar className="w-5 h-5" />
                            Book a Discovery Call
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">BB</span>
                                </div>
                                <span className="text-xl font-bold text-slate-900 tracking-tight">BrightBridge</span>
                            </div>
                            <p className="text-slate-400 text-sm max-w-xs font-medium">Empowering Montessori communities with professional AI enrollment intelligence.</p>
                        </div>

                    </div>
                    <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">&copy; 2026 BrightBridge. All Rights Reserved.</p>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100" />
                            <div className="w-8 h-8 rounded-full bg-slate-100" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
