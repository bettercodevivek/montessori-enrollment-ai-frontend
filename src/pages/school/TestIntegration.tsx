import { useEffect, useState } from 'react';
import { Loader2, CalendarDays, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

interface SchoolInfo {
    schoolName: string;
    businessHoursStart: string;
    businessHoursEnd: string;
    calendarConnected: boolean;
    calendarProvider: string | null;
}

interface Slot {
    start: string;
    end: string;
}

type Step = 'date' | 'form' | 'success';

export const SchoolTestIntegration = () => {
    const { user } = useAuthStore();
    const schoolId = user?.schoolId;

    const [info, setInfo] = useState<SchoolInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [step, setStep] = useState<Step>('date');
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

    const [parentName, setParentName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [childAge, setChildAge] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [bookedTime, setBookedTime] = useState('');
    const [calProvider, setCalProvider] = useState<string | null>(null);

    useEffect(() => {
        if (!schoolId) return;
        api.get(`/public/book-tour/${schoolId}`)
            .then(res => setInfo(res.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [schoolId]);

    const today = new Date().toISOString().split('T')[0];

    const loadSlots = async (date: string) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setSlotsLoading(true);
        try {
            const res = await api.get(`/public/book-tour/${schoolId}/slots?date=${date}`);
            setSlots(Array.isArray(res.data.freeSlots) ? res.data.freeSlots : []);
        } catch {
            setSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot || !parentName.trim()) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const res = await api.post(`/public/book-tour/${schoolId}`, {
                parentName: parentName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                childAge: childAge.trim(),
                reason: reason.trim(),
                scheduledAt: selectedSlot.start,
            });
            setBookedTime(selectedSlot.start);
            setCalProvider(res.data.booking?.calendarProvider || null);
            setStep('success');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Booking failed. Please try again.';
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const formatSlotTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatBookedDate = (iso: string) => {
        return new Date(iso).toLocaleString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (notFound || !info) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto">
                <h2 className="text-lg font-bold text-slate-900 mb-1">School info not available</h2>
                <p className="text-slate-500 text-sm">Please make sure your school profile is complete.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-soft">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Test Booking Integration</h1>
                <p className="text-sm text-slate-500 mt-0.5">Preview and test your school's booking form as it appears to parents.</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-slate-800 shadow-lg">
                        <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Book a Tour</h2>
                    <p className="text-slate-400 text-sm">{info.schoolName} — pick a date and time</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    {step === 'date' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select a date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    min={today}
                                    value={selectedDate}
                                    onChange={e => loadSlots(e.target.value)}
                                />
                            </div>

                            {selectedDate && (
                                <div className="animate-soft">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available times</label>
                                    {slotsLoading ? (
                                        <div className="py-8 flex justify-center">
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center py-6 italic">No available times on this date.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.start}
                                                    type="button"
                                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-all border ${selectedSlot?.start === slot.start
                                                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-medium'
                                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                                        }`}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatSlotTime(slot.start)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedSlot && (
                                <button
                                    type="button"
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-900/20"
                                    onClick={() => setStep('form')}
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="space-y-5 animate-soft">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-emerald-400">
                                    {new Date(selectedSlot!.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                                    at {formatSlotTime(selectedSlot!.start)}
                                </span>
                            </div>

                            {submitError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg">
                                    {submitError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your name *</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Jane Doe"
                                        value={parentName}
                                        onChange={e => setParentName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                        <input type="email" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 outline-none transition-all" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                                        <input type="tel" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 outline-none transition-all" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Child's age</label>
                                        <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 outline-none transition-all" placeholder="e.g. 3 years" value={childAge} onChange={e => setChildAge(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason</label>
                                        <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:border-blue-500 outline-none transition-all" placeholder="Enrollment inquiry" value={reason} onChange={e => setReason(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    className="px-4 bg-transparent border border-slate-700 text-slate-400 font-medium rounded-lg hover:border-slate-500 hover:text-slate-200 transition-all flex items-center gap-2"
                                    onClick={() => setStep('date')}
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-900/20"
                                    disabled={submitting || !parentName.trim()}
                                    onClick={handleBook}
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                                    {submitting ? 'Booking…' : 'Book Tour'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-4 space-y-6 animate-soft">
                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Tour Booked!</h2>
                                <p className="text-slate-400">Your tour has been scheduled at {info.schoolName}.</p>
                            </div>

                            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden text-left divide-y divide-slate-700">
                                <div className="flex justify-between px-4 py-3 text-sm">
                                    <span className="text-slate-500 font-medium">Name</span>
                                    <span className="text-slate-200">{parentName}</span>
                                </div>
                                <div className="flex justify-between px-4 py-3 text-sm">
                                    <span className="text-slate-500 font-medium">When</span>
                                    <span className="text-slate-200">{formatBookedDate(bookedTime)}</span>
                                </div>
                                {email && (
                                    <div className="flex justify-between px-4 py-3 text-sm">
                                        <span className="text-slate-500 font-medium">Email</span>
                                        <span className="text-slate-200">{email}</span>
                                    </div>
                                )}
                                {phone && (
                                    <div className="flex justify-between px-4 py-3 text-sm">
                                        <span className="text-slate-500 font-medium">Phone</span>
                                        <span className="text-slate-200">{phone}</span>
                                    </div>
                                )}
                                {calProvider && (
                                    <div className="flex justify-between px-4 py-3 text-sm">
                                        <span className="text-slate-500 font-medium">Calendar</span>
                                        <span className="text-emerald-400 font-medium">Added to {calProvider === 'google' ? 'Google' : 'Outlook'} Calendar</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="w-full border border-slate-700 text-slate-400 font-medium py-2.5 rounded-lg hover:border-slate-500 hover:text-slate-200 transition-all mt-4"
                                onClick={() => {
                                    setStep('date');
                                    setSelectedDate('');
                                    setSelectedSlot(null);
                                    setParentName(''); setEmail(''); setPhone(''); setChildAge(''); setReason('');
                                    setSubmitError('');
                                }}
                            >
                                Book another tour
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
