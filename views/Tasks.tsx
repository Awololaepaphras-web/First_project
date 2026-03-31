
import React from 'react';
import { User, EarnTask } from '../types';
import { Wallet, TrendingUp, Trophy, Zap, ExternalLink, ChevronRight, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TasksProps {
  user: User;
  tasks: EarnTask[];
  onCompleteTask: (taskId: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, tasks, onCompleteTask }) => {
  const navigate = useNavigate();

  const activeTasks = tasks.filter(t => !user.completedTasks?.includes(t.id));

  return (
    <div className="min-h-screen py-16 px-4 max-w-full mx-auto space-y-12 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter">Bounty <span className="text-brand-proph">Board</span></h1>
            <p className="text-brand-muted font-medium italic">Complete institutional actions to build your war chest.</p>
          </div>
          <div className="bg-brand-proph p-8 rounded-[3rem] text-black flex items-center gap-6 shadow-2xl shadow-brand-proph/20">
             <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center"><Coins className="w-8 h-8" /></div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Node Wallet</p>
                <p className="text-4xl font-black">{user.points || 0}</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTasks.length > 0 ? activeTasks.map(task => (
             <div key={task.id} className="bg-white dark:bg-brand-card p-10 rounded-[3rem] border border-brand-border flex flex-col justify-between hover:border-brand-proph transition-all shadow-xl group">
                <div>
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-brand-proph/10 text-brand-proph rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><TrendingUp className="w-6 h-6" /></div>
                      <span className="text-xl font-black dark:text-white">+{task.points} <span className="text-[10px] text-brand-muted uppercase">coins</span></span>
                   </div>
                   <h3 className="text-2xl font-black italic dark:text-white mb-2 leading-tight uppercase">{task.title}</h3>
                   <p className="text-brand-muted font-medium text-sm italic">Perform the required action and verify for instant bounty payout.</p>
                </div>
                <button 
                  onClick={() => { 
                    window.open(task.link, '_blank');
                    const answer = prompt(`Verification: ${task.question || 'Did you complete the task?'}`);
                    if (answer) {
                      onCompleteTask(task.id);
                      alert('Bounty verified and paid!');
                    }
                  }}
                  className="mt-10 w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group-hover:bg-brand-proph transition-all"
                >
                   Engage Target <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          )) : (
             <div className="col-span-full py-32 text-center space-y-6 bg-gray-50 dark:bg-brand-card/20 rounded-[4rem] border-2 border-dashed border-brand-border">
                <Trophy className="w-16 h-16 text-brand-proph mx-auto opacity-40" />
                <h3 className="text-2xl font-black dark:text-white uppercase italic">Queue Depleted</h3>
                <p className="text-brand-muted font-medium">Bounty board is currently clear of target nodes.</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default Tasks;
