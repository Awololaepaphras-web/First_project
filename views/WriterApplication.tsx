
import React, { useState } from 'react';
import { 
  PenTool, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Send, 
  Copy, 
  Award, 
  Users, 
  TrendingUp,
  FileText,
  Smartphone,
  Hash
} from 'lucide-react';
import { User } from '../types';

interface WriterApplicationProps {
  user: User | null;
}

const WriterApplication: React.FC<WriterApplicationProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    transactionId: '',
    matricNo: '',
    phone: '',
    subjects: '',
    motivation: ''
  });

  const accountDetails = {
    number: '7088903317',
    name: 'Awolola Epaphras',
    bank: 'Opay'
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(accountDetails.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, this would send a POST request to a backend
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6">
            <Award className="w-4 h-4" />
            <span>Join the Elite Creator Network</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Become a Proph <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">Content Writer</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 font-medium">
            Empower fellow students, share verified academic resources, and earn consistently. 
            Join the team reshaping Nigerian higher education.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Per Post</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Receive competitive rewards for every verified past question or study material you upload to our database.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Profile Badge</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get a "Verified Creator" badge on your profile, boosting your reputation within the Proph student community.
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Tools</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Access advanced creator tools and analytics to track your content performance and audience reach.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Payment Instructions */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Banknote className="w-7 h-7 text-green-600" />
                Activation Process
              </h2>
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Transfer Details</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500">Amount</span>
                      <span className="text-lg font-black text-green-600">#3,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-gray-900">{accountDetails.number}</span>
                        <button onClick={copyToClipboard} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500">Account Name</span>
                      <span className="text-sm font-black text-gray-800 uppercase">{accountDetails.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500">Bank</span>
                      <span className="text-sm font-black text-blue-600 uppercase">{accountDetails.bank}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-xs font-medium text-blue-700 leading-relaxed">
                    Once payment is completed, please copy the Transaction ID or Reference and fill the application form. Our admins verify all requests within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-100 p-6 rounded-3xl">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Verified Payment Gateway</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Security Protocol Alpha-9</p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Request Logged!</h2>
                <p className="text-gray-500 font-medium max-w-xs">
                  Your application and payment verification is being reviewed by the Proph Academic Board. You'll receive an email once activated.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all"
                >
                  Apply for Another Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Verification Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Hash className="w-3 h-3" /> Matric / Registration ID
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                      placeholder="e.g. 2018/1234"
                      value={formData.matricNo}
                      onChange={(e) => setFormData({...formData, matricNo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Smartphone className="w-3 h-3" /> WhatsApp Phone No.
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                      placeholder="e.g. 08123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Banknote className="w-3 h-3" /> Transaction ID / Reference
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                    placeholder="e.g. OPY_1234567890"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Specialized Subjects / Departments
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                    placeholder="e.g. General Math, Chemistry, Computer Science"
                    value={formData.subjects}
                    onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Why do you want to write for Proph?</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 resize-none"
                    placeholder="Tell us about your commitment to academic excellence..."
                    value={formData.motivation}
                    onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  />
                </div>

                {!user && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-tight leading-tight">
                      You must be signed in to link this application to your student account.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!user}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  Submit Application <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterApplication;
