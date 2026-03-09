"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const FRAME_COUNT = 176;

// Preload images
const preloadImages = () => {
  const images: HTMLImageElement[] = [];
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    // format to ezgif-frame-001.jpg -> ezgif-frame-176.jpg
    const frameIndex = i.toString().padStart(3, "0");
    img.src = `/sequence/ezgif-frame-${frameIndex}.jpg`;
    images.push(img);
  }
  return images;
};

export default function BackpackScrollViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load images on mount
  useEffect(() => {
    const loadedImages = preloadImages();
    // Wait for at least the first image to load to do an initial draw
    loadedImages[0].onload = () => {
      setImages(loadedImages);
      setIsLoaded(true);
    };
    
    // Fallback if cached
    if (loadedImages[0].complete) {
        setImages(loadedImages);
        setIsLoaded(true);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll 0 -> 1 to frame 0 -> 175
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // Text Animations Map
  // 0% - 20%
  const opacityText1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [1, 1, 0, 0]);
  const yText1 = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  // 30% - 50%
  const opacityText2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.55], [0, 1, 1, 0]);
  const xText2 = useTransform(scrollYProgress, [0.2, 0.3], [-50, 0]);

  // 60% - 80%
  const opacityText3 = useTransform(scrollYProgress, [0.5, 0.6, 0.8, 0.9], [0, 1, 1, 0]);
  const xText3 = useTransform(scrollYProgress, [0.5, 0.6], [50, 0]);

  // 95% - 100%
  const opacityText4 = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const scaleText4 = useTransform(scrollYProgress, [0.85, 0.95], [0.8, 1]);

  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal resolution for the canvas, can be based on the original image dimensions
    // Assuming a square-ish aspect based on typical sequences. 
    // We'll set a standard high-res and use CSS `object-fit: contain`
    canvas.width = 1080;
    canvas.height = 1080;

    const renderFrame = (index: number) => {
      const img = images[Math.round(index)];
      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image centered and covering/contained
        // Simple draw for now, assuming white background covers anything
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    renderFrame(0);
  }, [isLoaded, images]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[Math.round(latest)];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  });

  return (
    // Height determines how long the user has to scroll to see the full animation
    <div ref={containerRef} className="relative w-full h-[500vh] bg-background">
      
      {/* Sticky container for the canvas and text overlays */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* Canvas for 3D Sequence */}
        <canvas 
          ref={canvasRef}
          className="w-full h-full max-w-5xl object-contain z-10 mx-auto"
        />

        {/* --- Story Overlays --- */}
        
        {/* Story 1: 0% */}
        <motion.div 
          className="absolute z-20 flex flex-col items-center text-center pointer-events-none w-full px-4 pt-10 top-24"
          style={{ opacity: opacityText1, y: yText1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
            Balo Đồng Phục DAU
          </h1>
          <p className="text-xl md:text-2xl text-dau-red font-medium">
            Tự hào sinh viên Kiến Trúc Đà Nẵng
          </p>
        </motion.div>

        {/* Story 2: 40% */}
        <motion.div 
          className="absolute z-20 left-4 md:left-20 top-1/2 -translate-y-1/2 pointer-events-none max-w-sm"
          style={{ opacity: opacityText2, x: xText2 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
            Thiết Kế<br/><span className="text-dau-red">Năng Động.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Chất liệu trượt nước, bền bỉ cùng năm tháng.
          </p>
        </motion.div>

        {/* Story 3: 80% */}
        <motion.div 
          className="absolute z-20 right-4 md:right-20 top-1/2 -translate-y-1/2 pointer-events-none max-w-sm text-right"
          style={{ opacity: opacityText3, x: xText3 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
            Đệm Lưng<br/><span className="text-dau-red">Thoáng Khí.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Êm ái bảo vệ cột sống suốt ngày dài.
          </p>
        </motion.div>

        {/* Story 4: 100% */}
        <motion.div 
          className="absolute z-20 flex flex-col items-center text-center pointer-events-auto w-full px-4 bottom-24"
          style={{ opacity: opacityText4, scale: scaleText4 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8">
            Sẵn Sàng Tới Trường.
          </h2>
          <button className="bg-dau-red hover:bg-red-800 text-white transition-colors duration-300 px-10 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Đặt Hàng Ngay
          </button>
        </motion.div>

      </div>
    </div>
  );
}
