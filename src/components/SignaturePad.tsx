"use client";

import React, { useRef, useState, useEffect } from "react";
import { Pen, Upload, Type, Trash, Undo } from "lucide-react";

interface SignaturePadProps {
  label: string;
  value?: string;
  onChange: (signatureData: string) => void;
  language?: "en" | "bn";
}

export default function SignaturePad({ label, value, onChange, language = "en" }: SignaturePadProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "upload" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const t = {
    en: {
      draw: "Draw",
      upload: "Upload",
      type: "Type",
      clear: "Clear",
      placeholder: "Type your name...",
      uploadText: "Drop image or click to upload",
      reDraw: "Draw Signature",
    },
    bn: {
      draw: "আঁকুন",
      upload: "আপলোড",
      type: "টাইপ",
      clear: "মুছুন",
      placeholder: "আপনার নাম লিখুন...",
      uploadText: "ছবি ড্রপ করুন বা আপলোড করতে ক্লিক করুন",
      reDraw: "স্বাক্ষর আঁকুন",
    }
  }[language];

  // Draw Canvas setup
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#0B3954"; // Ink Navy Blue
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeTab]);

  // Load existing drawing if any
  useEffect(() => {
    if (value && activeTab === "draw" && canvasRef.current) {
      if (value.startsWith("data:image")) {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = value;
      }
    }
  }, [value, activeTab]);

  // Handlers for drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveCanvas();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange("");
    }
  };

  // Upload image handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Type signature handler
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedName(val);
    
    // Generate text as canvas image to behave like an image signature in PDF
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "italic 32px cursive, Brush Script MT, Playball, sans-serif";
      ctx.fillStyle = "#0b3954"; // Navy
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(val, canvas.width / 2, canvas.height / 2);
      onChange(canvas.toDataURL("image/png"));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        
        {/* Tab Selection */}
        <div className="flex border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("draw")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "draw"
                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            {t.draw}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "upload"
                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {t.upload}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("type")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "type"
                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            {t.type}
          </button>
        </div>
      </div>

      {/* Drawing area */}
      {activeTab === "draw" && (
        <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-950">
          <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full h-[100px] cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 text-red-500 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium"
          >
            <Trash className="w-3 h-3" />
            {t.clear}
          </button>
        </div>
      )}

      {/* Upload image area */}
      {activeTab === "upload" && (
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-4 text-center">
          {value && value.startsWith("data:image") ? (
            <div className="relative inline-block mx-auto border border-zinc-200 dark:border-zinc-800 rounded p-1 bg-white dark:bg-zinc-900">
              <img src={value} alt="Signature Preview" className="h-[80px] max-w-full object-contain" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer py-4">
              <Upload className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.uploadText}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Type signature area */}
      {activeTab === "type" && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder={t.placeholder}
            value={typedName}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3954] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
          />
          {typedName && (
            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-950 text-center select-none overflow-hidden">
              <span className="text-3xl text-[#0B3954] dark:text-sky-400 font-medium italic block" style={{ fontFamily: "cursive, 'Brush Script MT', Playball" }}>
                {typedName}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
