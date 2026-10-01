'use client';

import * as React from 'react';

interface ImageCropperProps {
  file: File;
  onCancel: () => void;
  onComplete: (file: File) => void;
}

const WIDTH = 1280;
const HEIGHT = 720;

export function ImageCropper({ file, onCancel, onComplete }: ImageCropperProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const dragRef = React.useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [ready, setReady] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const baseScale = Math.max(WIDTH / image.naturalWidth, HEIGHT / image.naturalHeight);
    const scale = baseScale * zoom;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const maxX = Math.max(0, (drawWidth - WIDTH) / 2);
    const maxY = Math.max(0, (drawHeight - HEIGHT) / 2);
    const offsetX = Math.max(-maxX, Math.min(maxX, pan.x));
    const offsetY = Math.max(-maxY, Math.min(maxY, pan.y));
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.drawImage(image, (WIDTH - drawWidth) / 2 + offsetX, (HEIGHT - drawHeight) / 2 + offsetY, drawWidth, drawHeight);
  }, [pan, zoom]);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { imageRef.current = image; setReady(true); };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  React.useEffect(() => { if (ready) draw(); }, [draw, ready]);

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratioX = WIDTH / rect.width;
    const ratioY = HEIGHT / rect.height;
    setPan({
      x: dragRef.current.panX + (event.clientX - dragRef.current.x) * ratioX,
      y: dragRef.current.panY + (event.clientY - dragRef.current.y) * ratioY,
    });
  };

  const complete = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setProcessing(true);
    canvas.toBlob((blob) => {
      if (!blob) { setProcessing(false); return; }
      const name = file.name.replace(/\.[^.]+$/, '') + '-thumbnail.webp';
      onComplete(new File([blob], name, { type: 'image/webp', lastModified: Date.now() }));
    }, 'image/webp', 0.82);
  };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div><h2 className="text-lg font-bold text-slate-900">Cắt ảnh minh họa</h2><p className="text-sm text-slate-500">Kéo ảnh để chọn vùng hiển thị theo tỷ lệ 16:9.</p></div>
          <button type="button" onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="bg-slate-900 p-4 sm:p-6">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="aspect-video w-full cursor-grab rounded-xl bg-slate-800 object-contain active:cursor-grabbing"
            onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }; }}
            onPointerMove={pointerMove}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerCancel={() => { dragRef.current = null; }}
          />
        </div>
        <div className="space-y-4 p-5">
          <label className="flex items-center gap-3"><span className="material-symbols-outlined text-violet-600">zoom_in</span><span className="text-sm font-semibold text-slate-700">Phóng ảnh</span><input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="flex-1 accent-primary" /><span className="w-12 text-right text-sm font-bold text-primary">{Math.round(zoom * 100)}%</span></label>
          <p className="text-xs text-slate-500">Ảnh đầu ra được tự động nén thành WEBP 1280×720 trước khi tải lên Cloudinary.</p>
          <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="h-11 rounded-xl border border-slate-300 px-5 font-semibold text-slate-700">Hủy</button><button type="button" disabled={!ready || processing} onClick={complete} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white disabled:opacity-50"><span className="material-symbols-outlined text-[19px]">crop</span>{processing ? 'Đang xử lý...' : 'Cắt và sử dụng'}</button></div>
        </div>
      </div>
    </div>
  );
}
