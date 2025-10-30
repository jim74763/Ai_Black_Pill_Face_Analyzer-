import React, { useRef, useState, useEffect, useCallback } from 'react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCameraError: (error: string) => void;
}

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);


const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCountdown = () => {
    setCountdown(3);
  };

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];
        onCapture(base64Data);
      }
    }
  }, [onCapture]);

  useEffect(() => {
    // FIX: Replaced `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` for browser compatibility.
    let countdownInterval: ReturnType<typeof setTimeout>;
    if (countdown !== null) {
      if (countdown > 0) {
        countdownInterval = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
      } else {
        handleCapture();
      }
    }
    return () => clearTimeout(countdownInterval);
  }, [countdown, handleCapture]);


  useEffect(() => {
    async function getCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        onCameraError("Could not access the camera. Please check your browser permissions.");
      }
    }
    getCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCameraError]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="relative w-full aspect-square md:aspect-video bg-base-300 rounded-lg overflow-hidden shadow-lg border-4 border-base-200">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {countdown !== null && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-9xl">{countdown}</span>
                </div>
            )}
            {!hasCamera && <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white">Activating Camera...</div>}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <button
            onClick={startCountdown}
            disabled={!hasCamera || countdown !== null}
            className="mt-6 flex items-center gap-3 px-8 py-4 bg-brand-primary text-white font-bold rounded-full text-xl shadow-lg transition-all duration-300 ease-in-out hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
        >
            <CameraIcon className="w-8 h-8"/>
            {countdown !== null ? 'Capturing...' : 'Capture Photo'}
        </button>
    </div>
  );
};

export default WebcamCapture;