import React from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, ShieldCheck, BarChart3, Clock, ArrowRight,
  CheckCircle2, MapPin, Wrench
} from 'lucide-react'
import { FrameBorder } from '../components/ui/FrameBorder'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/95 sticky top-0 z-30">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white text-base tracking-tight">CampusPulse</span>
              <span className="text-[11px] ml-2 text-slate-400 font-mono">v1.0</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="btn-primary text-xs py-1.5 px-3"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Unslopped Hero Section: Asymmetric Split */}
      <section className="px-6 pt-12 pb-16 lg:pt-20 lg:pb-24 max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Copy & Actions (7 cols) */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 font-mono mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Campus maintenance dispatch</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.12] mb-5">
              Facilities issue tracking and dispatch resolution
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed font-normal mb-7">
              A direct operational link between students, wardens, and campus maintenance engineers.
              Automatic urgency classification, guaranteed SLA resolution tracking, and complete audit history.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                to="/register"
                className="btn-primary text-sm py-2 px-4 shadow-sm"
              >
                <span>Report an issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-sm py-2 px-4 bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
              >
                Sign in with demo account
              </Link>
            </div>

            {/* Operational Telemetry Line */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-lg font-semibold text-white font-mono tabular-nums">3.2h</p>
                <p className="text-xs text-slate-400 mt-0.5">Average fix time</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white font-mono tabular-nums">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Audited history</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white font-mono tabular-nums">24h</p>
                <p className="text-xs text-slate-400 mt-0.5">Duplicate check</p>
              </div>
            </div>
          </div>

          {/* Right Column: Crafted Coded Dispatch Console Preview Framed in FrameBorder (5 cols) */}
          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <FrameBorder
              radius={16}
              lineWidth={1.5}
              glow={0.75}
              glowWidth={14}
              flowSpeed={1}
              accentColor="#3b82f6"
              baseBorderColor="rgba(255, 255, 255, 0.1)"
              className="shadow-2xl"
            >
              <div className="card p-4 sm:p-5 bg-[#0f1424] border-0">
                {/* Console Header */}
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-slate-300 font-medium">Dispatch queue</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">Live operational feed</span>
                </div>

                {/* Active Ticket Card (Moment) */}
                <div className="bg-[#141b2f] border border-slate-700/70 rounded-lg p-3.5 mb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-blue-400 font-medium bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                      CP-2024-00104
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      High priority
                    </span>
                  </div>

                  <p className="text-sm font-medium text-white mb-1.5">
                    Water supply disruption in 2nd floor restroom
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Hostel Block B
                    </span>
                    <span>•</span>
                    <span>Water & Plumbing</span>
                  </div>

                  {/* Progress bar state */}
                  <div className="bg-slate-900/90 rounded p-2.5 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-300 flex items-center gap-1 font-medium">
                        <Wrench className="w-3 h-3" />
                        Technician dispatched
                      </span>
                      <span className="text-slate-400 font-mono tabular-nums">12m ago</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-2/3" />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      "Plumbing contractor en route with replacement copper valve"
                    </p>
                  </div>
                </div>

                {/* Secondary Queue Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-slate-400">CP-2024-00105</span>
                      <span className="text-slate-300 truncate">Exposed wire sparking in socket</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 flex-shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Critical
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-slate-400">CP-2024-00098</span>
                      <span className="text-slate-300 truncate">Ceiling fan motor replaced</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 flex-shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Resolved
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>3 active triage engineers online</span>
                  <span className="font-mono">SLA standard</span>
                </div>
              </div>
            </FrameBorder>
          </div>

        </div>
      </section>

      {/* Feature Row */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Structured reporting',
              desc: 'Standardized forms with category tagging, location pickers, and automated safety keyword elevation.'
            },
            {
              icon: BarChart3,
              title: 'Operational analytics',
              desc: 'Metrics tracking volume across campus zones, categories, priority levels, and 7-day trends.'
            },
            {
              icon: ShieldCheck,
              title: 'Audited resolution',
              desc: 'State changes are recorded with operator, timestamp, and verification notes for full accountability.'
            }
          ].map((feat, i) => (
            <div key={i} className="p-5 rounded-lg bg-slate-900/40 border border-slate-800">
              <feat.icon className="w-5 h-5 text-blue-400 mb-3" />
              <h3 className="font-medium text-sm text-white mb-1.5">{feat.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 mb-5">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <h3 className="font-medium text-sm text-white">Pre-configured demo accounts</h3>
              <p className="text-slate-400 text-xs">Test both student and administrator workflows immediately</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {/* Admin Box */}
            <div className="p-4 rounded-lg bg-[#0a0f1d] border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-400">Administrator</span>
                <span className="text-slate-400 font-mono text-[11px]">Full access</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p>Email: <code className="font-mono text-white">admin@campuspulse.edu</code></p>
                <p>Password: <code className="font-mono text-white">admin123</code></p>
              </div>
            </div>

            {/* Student Box */}
            <div className="p-4 rounded-lg bg-[#0a0f1d] border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-200">Student</span>
                <span className="text-slate-400 font-mono text-[11px]">Submission & tracking</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p>Email: <code className="font-mono text-white">student@campuspulse.edu</code></p>
                <p>Password: <code className="font-mono text-white">student123</code></p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Alex (student): <code className="text-slate-300 font-mono">alex@campuspulse.edu</code> / <code className="text-slate-300 font-mono">test123</code></span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
              Sign in <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 text-xs border-t border-slate-800/80">
        <p>© 2026 CampusPulse — Smart Campus Issue Reporting & Resolution System</p>
        <p className="mt-0.5 text-slate-400">Built with React, Vite, Node.js and SQLite</p>
      </footer>
    </div>
  )
}
