
import React, { useState, useCallback, useRef } from 'react';
import WebcamCapture from './components/WebcamCapture';
import AnalysisResults from './components/AnalysisResults';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeFace, generateImprovedImage } from './services/geminiService';
import type { AttractivenessReport } from './types';

type AppState = 'idle' | 'capturing' | 'analyzing' | 'results' | 'error';

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);


const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisReport, setAnalysisReport] = useState<AttractivenessReport | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleStart = () => {
        setAppState('capturing');
    };

    const handleRetry = () => {
        setAppState('idle');
        setCapturedImage(null);
        setAnalysisReport(null);
        setGeneratedImage(null);
        setError(null);
    };
    
    const handleCameraError = (errorMessage: string) => {
        setError(errorMessage);
        setAppState('error');
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = (e.target?.result as string)?.split(',')[1];
                if (base64) {
                    handleCapture(base64);
                } else {
                    setError("Could not read the uploaded file.");
                    setAppState('error');
                }
            };
            reader.onerror = () => {
                 setError("Error reading file.");
                 setAppState('error');
            }
            reader.readAsDataURL(file);
        }
    };

    const handleCapture = useCallback(async (imageBase64: string) => {
        setCapturedImage(imageBase64);
        setAppState('analyzing');
        setError(null);

        try {
            setLoadingMessage('Assessing your genetic reality...');
            const analysisPromise = analyzeFace(imageBase64);
            
            setLoadingMessage('Calculating your ascended form...');
            const generationPromise = generateImprovedImage(imageBase64);

            setLoadingMessage('starting the slop train');
            const [report, newImage] = await Promise.all([analysisPromise, generationPromise]);

            setAnalysisReport(report);
            setGeneratedImage(newImage);
            setAppState('results');
        } catch (err) {
            console.error("Analysis failed:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to analyze image. ${errorMessage}`);
            setAppState('error');
        }
    }, []);

    const renderContent = () => {
        switch (appState) {
            case 'capturing':
                return <WebcamCapture onCapture={handleCapture} onCameraError={handleCameraError} />;
            case 'analyzing':
                return (
                    <div className="relative w-full max-w-md mx-auto">
                        <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Captured face" className="rounded-lg shadow-lg" />
                        <LoadingSpinner message={loadingMessage} />
                    </div>
                );
            case 'results':
                return (
                    <AnalysisResults
                        originalImage={capturedImage}
                        generatedImage={generatedImage}
                        report={analysisReport}
                        onRetry={handleRetry}
                    />
                );
            case 'error':
                 return (
                    <div className="text-center p-8 bg-base-200 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 mb-4">
                            AI Looksmaxxing Analyzer
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-gray-300 mb-8">
                            Uncover the harsh truths of your facial genetics. Our AI delivers an unfiltered analysis based on lookism principles and shows your potential if you were to 'ascend'.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleStart}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white font-bold rounded-full text-xl shadow-lg transition-all duration-300 ease-in-out hover:bg-brand-secondary transform hover:scale-105"
                            >
                                <CameraIcon className="w-8 h-8" />
                                Use Camera
                            </button>
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-secondary text-white font-bold rounded-full text-xl shadow-lg transition-all duration-300 ease-in-out hover:bg-brand-primary transform hover:scale-105"
                            >
                                <UploadIcon className="w-8 h-8" />
                                Upload Photo
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/png, image/jpeg"
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-8 max-w-md mx-auto">
                           Disclaimer: This tool is for entertainment purposes only. Attractiveness is subjective and not determined by an algorithm. Your images are not stored.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4 md:p-8">
            <main className="w-full">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
