import { Award, Trophy, TrendingUp, Home } from 'lucide-react';
import { useState } from 'react';

export default function ResultsScreen({ score, onRestart }) {
  const getPerformanceLevel = () => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' };
    if (score >= 50) return { level: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
    return { level: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/50 mb-4">
            <Trophy className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Interview Complete!</h1>
          <p className="text-slate-400">Here's how you performed</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-700" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                  className="text-blue-400 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-1">{score}</div>
                  <div className="text-slate-400 text-sm">out of 100</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${performance.bg} ${performance.border} mb-6`}>
            <div className="flex items-center justify-center space-x-2">
              <Award className={`w-5 h-5 ${performance.color}`} />
              <span className={`text-lg font-semibold ${performance.color}`}>{performance.level}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">Performance Analysis</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {score >= 90 && "Outstanding work! You demonstrated excellent problem-solving skills and code quality."}
                  {score >= 70 && score < 90 && "Good job! You showed solid understanding. Keep practicing to reach excellence."}
                  {score >= 50 && score < 70 && "You're on the right track. Focus on understanding core concepts better."}
                  {score < 50 && "Keep learning and practicing. Review fundamental concepts and try more problems."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-white mb-1">{score >= 70 ? 'Pass' : 'Fail'}</div>
                <div className="text-slate-400 text-sm">Status</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-white mb-1">{Math.floor(score / 10)}/10</div>
                <div className="text-slate-400 text-sm">Rating</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Home className="w-5 h-5" />
          <span>Back to Topics</span>
        </button>
      </div>
    </div>
  );
}
