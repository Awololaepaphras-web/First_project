
import React from 'react';

interface LegalPageProps {
  title: string;
  content: string;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, content }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-4 border-green-600 inline-block">
          {title}
        </h1>
        <div className="prose prose-lg text-gray-600 leading-loose">
          {content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
