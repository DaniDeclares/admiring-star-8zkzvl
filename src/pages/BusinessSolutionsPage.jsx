import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BusinessSolutionsPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Business & PMO Operations</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Business Solutions & Notary</h1>
          <p className="text-slate-300 text-lg">Turnkey administrative execution, startup infrastructure kits, mobile notary public, and legal document preparation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Briefcase className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Mobile Notary & Loan Signing</h3>
            <p className="text-slate-400 text-sm mb-4">On-demand mobile notary public, remote I-9 verifications, loan signing agent execution, and court courier dispatch.</p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> $30 Mobile Notary Visit</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> $150 Loan Signing Agent Package</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Express Court Filing & Legal Delivery</li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <FileText className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Business Startup Infrastructure</h3>
            <p className="text-slate-400 text-sm mb-4">Complete business startup kits, corporate registration support, custom Master SOP manual development, and compliance binders.</p>
            <ul className="space-y-2 mb-6 text-sm text-slate-300">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> $199 Business Startup Kit</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> $500 Master SOP Manual Package</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Corporate Compliance & Administrative Setup</li>
            </ul>
          </div>
        </div>
        <div className="text-center">
          <Link to="/request-service" className="inline-flex items-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all">
            Book Business Solution <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
