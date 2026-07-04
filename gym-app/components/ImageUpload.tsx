"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Trash2, X, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  defaultValue?: string | null;
  name?: string;
}

export default function ImageUpload({ defaultValue = null, name = "image" }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultValue);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Cleanup camera stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please check permissions or upload a file.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Find the source rectangle to crop to a square
      const size = Math.min(video.videoWidth, video.videoHeight) || 300;
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setImage(dataUrl);
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size is too large. Please select an image under 5MB.");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = Math.min(img.width, img.height);
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, 300, 300);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            setImage(dataUrl);
          } else {
            setError("Could not process this image. Please try another file.");
          }
        };
        img.onerror = () => {
          setError("Could not read this image. Please try another file.");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-primary block">
        Member Photo <span className="text-text-muted">(optional)</span>
      </label>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        
        {/* Preview / Video Window */}
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-text-muted flex flex-col items-center gap-1.5">
              <Camera size={28} className="stroke-[1.5]" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Add photo</span>
            </div>
          )}

          {/* Quick Clear Hover Button */}
          {!cameraActive && image && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {cameraActive ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 sm:flex-initial rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all active:scale-[0.98]"
              >
                Snap Photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] p-2 text-text-primary transition-all active:scale-[0.98]"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] px-3.5 py-2 text-xs font-semibold text-text-primary transition-all duration-200 active:scale-[0.98]"
                >
                  <Upload size={14} />
                  Choose File
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
                >
                  <Camera size={14} />
                  Use Camera
                </button>

                {image && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-text-muted">
                Accepts JPEG, PNG, WEBP. Photos are cropped square and compressed before saving.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Hidden inputs to capture state in FormData */}
      <input type="hidden" name={name} value={image || ""} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
