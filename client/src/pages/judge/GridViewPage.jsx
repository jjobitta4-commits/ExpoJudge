import React from 'react';
import GridView from '../../components/judge/GridView.jsx';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { useEvent } from '../../context/EventContext.jsx';

export default function GridViewPage() {
  const { activeEvent } = useEvent();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 p-2 -ml-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium">
          {activeEvent?.name}
        </span>
      </div>

      <GridView />
    </div>
  );
}
