'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, Upload, X, Check, RotateCw } from 'lucide-react';

interface CameraProps {
  onCapture: (imageBase64: string) => void;
  autoSubmit?: boolean;
}

export function Camera({ onCapture, autoSubmit = true }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const handleSubmit = useCallback((image?: string) => {
    const imageToSubmit = image || capturedImage;
    if (imageToSubmit) {
      onCapture(imageToSubmit);
      setCapturedImage(null);
      setIsOpen(false);
    }
  }, [capturedImage, onCapture]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      if (autoSubmit) {
        handleSubmit(imageSrc);
      }
    }
  }, [autoSubmit, handleSubmit]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        if (autoSubmit) {
          handleSubmit(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center justify-center py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-lg"
        >
          <CameraIcon className="w-6 h-6 mr-2" />
          Quick Capture
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center py-4 px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          <Upload className="w-6 h-6" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full flex flex-col">
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
          <button
            onClick={() => {
              setIsOpen(false);
              setCapturedImage(null);
            }}
            className="p-3 bg-black/50 text-white rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          
          {!capturedImage && (
            <button
              onClick={toggleCamera}
              className="p-3 bg-black/50 text-white rounded-full"
            >
              <RotateCw className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {capturedImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImage}
                alt="Captured food"
                className="max-w-full max-h-full object-contain"
              />
            </>
          ) : (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode,
                width: 1280,
                height: 720,
              }}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/50">
          {capturedImage ? (
            <div className="flex gap-4 justify-center">
              <button
                onClick={retake}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-full transition-colors"
              >
                Retake
              </button>
              
              {!autoSubmit && (
                <button
                  onClick={() => handleSubmit()}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors flex items-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Use Photo
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={capture}
              className="mx-auto block w-20 h-20 bg-white hover:bg-gray-100 rounded-full transition-colors border-4 border-gray-300"
              aria-label="Capture photo"
            />
          )}
        </div>
      </div>
    </div>
  );
}