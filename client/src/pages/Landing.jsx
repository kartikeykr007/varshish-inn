import React from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, ShieldCheck, BarChart3, Clock, ArrowRight,
  CheckCircle2
} from 'lucide-react'

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

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        {/* Release badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs text-slate-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Campus issue reporting and resolution system</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
          Report campus facility issues.<br />
          Follow resolution in real time.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
          A direct operational link between students and campus maintenance teams.
          Immediate report filing, automated urgency triage, and complete audit history.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14">
          <Link
            to="/register"
            className="btn-primary text-sm py-2.5 px-5 w-full sm:w-auto"
          >
            <span>Report an issue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary text-sm py-2.5 px-5 w-full sm:w-auto bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800"
          >
            Sign in with demo account
          </Link>
        </div>

        {/* Product Preview Card */}
        <div className="card text-left p-4 sm:p-6 bg-[#0f1423] border-slate-800 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400 font-mono ml-2">dispatch.campuspulse.internal</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live queue</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { id: 'CP-2024-00104', title: 'Water leakage in 2nd floor restroom', loc: 'Hostel Block B', prio: 'High', stat: 'In Progress', dot: 'bg-blue-500' },
              { id: 'CP-2024-00105', title: 'Exposed wire sparking behind socket', loc: 'Science Block', prio: 'Critical', stat: 'Submitted', dot: 'bg-rose-500' },
              { id: 'CP-2024-00098', title: 'Classroom ceiling fan motor replaced', loc: 'Room 204', prio: 'Medium', stat: 'Resolved', dot: 'bg-emerald-500' }
            ].map(row => (
              <div key={row.id} className="flex items-center justify-between p-2.5 rounded bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[11px] text-slate-400">{row.id}</span>
                  <span className="text-slate-200 truncate">{row.title}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-[11px]">
                  <span className="text-slate-400 hidden sm:inline">{row.loc}</span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                    {row.stat}
                  </span>
                </div>
              </div>
            ))}
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
