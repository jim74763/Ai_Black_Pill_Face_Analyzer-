
import React from 'react';
import type { AttractivenessReport, AttractivenessFactor } from '../types';
import ScoreGauge from './ScoreGauge';

interface AnalysisResultsProps {
  originalImage: string | null;
  generatedImage: string | null;
  report: AttractivenessReport | null;
  onRetry: () => void;
}

const ReloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-3.181-4.991-3.181-3.183a8.25 8.25 0 0 0-11.664 0l-3.181 3.183" />
  </svg>
);


const FactorBar: React.FC<{ factor: AttractivenessFactor }> = ({ factor }) => (
  <div className="mb-4">
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-gray-300">{factor.name}</span>
      <span className="text-sm font-bold text-white">{factor.score.toFixed(1)}/10</span>
    </div>
    <div className="w-full bg-base-300 rounded-full h-2.5">
      <div
        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full"
        style={{ width: `${factor.score * 10}%` }}
      ></div>
    </div>
     <p className="text-xs text-gray-400 mt-1 italic">"{factor.description}"</p>
  </div>
);

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ originalImage, generatedImage, report, onRetry }) => {
  if (!report || !originalImage || !generatedImage) {
    return <div>Error displaying results.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="flex flex-col items-center p-4 bg-base-200 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-4">Your Photo vs. Ascended Version</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Current</h3>
                    <img src={`data:image/jpeg;base64,${originalImage}`} alt="Original" className="rounded-lg shadow-md w-full aspect-square object-cover" />
                </div>
                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2 text-brand-primary">Ascended</h3>
                    <img src={`data:image/png;base64,${generatedImage}`} alt="Generated" className="rounded-lg shadow-md w-full aspect-square object-cover" />
                </div>
            </div>
        </div>

        <div className="flex flex-col p-6 bg-base-200 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-4">Genetic Report</h2>
          <p className="text-center text-xl italic text-gray-300 mb-4">"{report.summary}"</p>
          <div className="flex justify-center mb-4">
             <ScoreGauge score={report.overallScore} />
          </div>
          <div className="space-y-4">
            {report.factors.map((factor, index) => (
              <FactorBar key={index} factor={factor} />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white font-bold rounded-full text-xl shadow-lg transition-all duration-300 ease-in-out hover:bg-brand-secondary transform hover:scale-105"
        >
          <ReloadIcon className="w-8 h-8"/>
          Rate Another Face
        </button>
      </div>
    </div>
  );
};

export default AnalysisResults;