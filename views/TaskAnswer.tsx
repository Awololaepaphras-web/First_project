
import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { EarnTask } from '../types';
import { HelpCircle, CheckCircle2, ArrowLeft, Send, Sparkles } from 'lucide-react';

interface TaskAnswerProps {
  tasks: EarnTask[];
  onComplete: (taskId: string, points: number) => void;
}

const TaskAnswer: React.FC<TaskAnswerProps> = ({ tasks, onComplete }) => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const task = tasks.find(t => t.id === taskId);

  if (!task) return <Navigate to="/tasks" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    onComplete(task.id, task.points);
    setStatus('success');
    
    setTimeout(() => {
      navigate('/tasks');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <button 
          onClick={() => navigate('/tasks')}
          className="mb-8 flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Cancel Task
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-green-600 p-10 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Validation Challenge</h1>
                <p className="text-green-100 text-sm font-medium">Verify your engagement to claim +{task.points} pts</p>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
              <p className="text-lg font-bold leading-relaxed">
                "{task.question}"
              </p>
            </div>
          </div>

          <div className="p-10">
            {status === 'success' ? (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Bounty Claimed!</h2>
                <p className="text-gray-500 font-medium">Your answer has been recorded. Points added to your wallet.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Answer / Evidence</label>
                  <textarea
                    required
                    rows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-gray-700 resize-none"
                    placeholder="Provide your response based on the page you just visited..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                >
                  Submit & Earn Points <Send className="w-5 h-5" />
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Points are awarded instantly upon submission.
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <Sparkles className="w-4 h-4" />
          <p className="text-xs font-medium italic">Proph uses human-verification loops to ensure academic integrity.</p>
        </div>
      </div>
    </div>
  );
};

export default TaskAnswer;
