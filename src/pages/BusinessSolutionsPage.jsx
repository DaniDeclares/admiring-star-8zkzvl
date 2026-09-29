import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BusinessSolutionsPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Business & Administrative Support</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Business Work, Handled.</h1>
          <p className="text-slate-300 text-lg">Administrative, field, workplace and operational support for the work behind the business. Browse the full service catalog or send a request for a specific project.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <Briefcase className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Administrative Support</h3>
            <p className="text-slate-400 text-sm mb-4">Practical support for the work behind the business.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Administrative support</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Document preparation and organization</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Data, records and spreadsheet support</li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <FileText className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Business Field Support</h3>
            <p className="text-slate-400 text-sm mb-4">When the business needs coordinated work on the ground.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Business field runner / site support</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Vendor/site coordination support</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Supply pickup and delivery runs</li>
            </ul>
          </div>
        </div>
        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/catalog" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all">Browse Services <ArrowRight className="ml-2 w-5 h-5" /></Link>
          <Link to="/request-service" className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-amber-500 text-amber-300 font-bold text-base transition-all">Request Business Support</Link>
        </div>
      </div>
    </div>
  );
}
