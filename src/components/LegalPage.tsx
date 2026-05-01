import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type LegalPageProps = {
  title: string;
  children: ReactNode;
};

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm">BB</span>
            BrightBridge
          </Link>
          <Link to="/" className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">
            Home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: May 1, 2026</p>
        <article className="space-y-6 text-slate-700 leading-relaxed text-[15px]">{children}</article>
      </main>
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <span>© 2026 BrightBridge</span>
          <span className="hidden sm:inline">·</span>
          <Link to="/privacy" className="hover:text-blue-600 font-medium transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-blue-600 font-medium transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
