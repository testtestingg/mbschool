import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCw, RefreshCw,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { LoadingSpinner } from '../LoadingSpinner';
import { PdfExercise } from '../../types';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerWithChatProps {
  pdfExercises: PdfExercise[];
  correctionExercises?: PdfExercise[];
  resumeExercises?: PdfExercise[];
  activeTab: 'exercises' | 'corrections' | 'resume';
  courseId?: string;
  courseTitle?: string;
  customPdfName?: string;
  initialFileId?: string; 
  onClose?: () => void;
}

/** Cache simple */
type CacheEntry = { url: string; ts: number; isBlob: boolean };
const pdfCache = new Map<string, CacheEntry>();
const makeKey = (pdf: PdfExercise) => `${pdf.id}|${(pdf.path || '').slice(0, 50)}`;
const cleanupCache = () => {
  const now = Date.now();
  for (const [k, v] of pdfCache.entries()) {
    if (now - v.ts > 10 * 60 * 1000) {
      if (v.isBlob && v.url.startsWith('blob:')) {
        try { URL.revokeObjectURL(v.url); } catch {}
      }
      pdfCache.delete(k);
    }
  }
};
const normalizePdfData = (pdfData?: string): string | null => {
  if (!pdfData || pdfData === 'loading') return null;
  if (pdfData.startsWith('data:application/pdf;base64,data:text/html;base64,')) {
    return `data:application/pdf;base64,${pdfData.replace('data:application/pdf;base64,data:text/html;base64,', '')}`;
  }
  return pdfData;
};

/** util */
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const PDFViewerWithChat = ({
  pdfExercises,
  correctionExercises = [],
  resumeExercises = [],
  activeTab,
  initialFileId,
  onClose,
}: PDFViewerWithChatProps) => {
  const isMobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
    []
  );

  const currentExercises =
    activeTab === 'exercises' ? pdfExercises :
    activeTab === 'corrections' ? correctionExercises : resumeExercises;

  const currentPdfExercise = useMemo(() => {
    return currentExercises.find(e => e.id === initialFileId) || currentExercises[0];
  }, [currentExercises, initialFileId]);

  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);

  const [rotation, setRotation] = useState(0);

  /** Zoom = multiplicateur UX (0.5 → 3) */
  const [zoom, setZoom] = useState(0.75);

  /** largeur mesurée (debounced) */
  const [viewportWidth, setViewportWidth] = useState<number>(0);

  /** Fullscreen sync */
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fullscreenRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  /** pinch state */
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  // Reset page and zoom when the parent changes the active file
  useEffect(() => {
    setPage(1);
    setZoom(0.75);
  }, [initialFileId]);

  // ---- Measure container width (debounced)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth;
        // padding interne: on garde une marge pour l'ombre + confort
        setViewportWidth(Math.max(320, w - 32));
      });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update(); // Initial measure

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isFullscreen, pdfLoading, pdfFile]); 

  // ---- Load PDF
  useEffect(() => {
    cleanupCache();
    setPdfError(null);
    setPdfLoading(true);

    if (!currentPdfExercise) {
      setPdfFile(null);
      setPdfLoading(false);
      return;
    }

    const key = makeKey(currentPdfExercise);
    const hit = pdfCache.get(key);
    if (hit) {
      setPdfFile(hit.url);
      setPdfLoading(false);
      return;
    }

    const data = normalizePdfData(currentPdfExercise.data);
    if (data) {
      pdfCache.set(key, { url: data, ts: Date.now(), isBlob: data.startsWith('blob:') });
      setPdfFile(data);
      setPdfLoading(false);
      return;
    }

    if (currentPdfExercise.path) {
      const safeUrl = encodeURI(currentPdfExercise.path);
      pdfCache.set(key, { url: safeUrl, ts: Date.now(), isBlob: false });
      setPdfFile(safeUrl);
      setPdfLoading(false);
      return;
    }

    setPdfError('Source PDF indisponible');
    setPdfLoading(false);
  }, [currentPdfExercise]);

  // ---- Fullscreen change listeners
  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        // @ts-expect-error webkit
        document.webkitFullscreenElement ||
        // @ts-expect-error moz
        document.mozFullScreenElement ||
        // @ts-expect-error ms
        document.msFullscreenElement;

      setIsFullscreen(!!fsEl);
    };

    document.addEventListener('fullscreenchange', onFsChange);
    // @ts-expect-error webkit
    document.addEventListener('webkitfullscreenchange', onFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      // @ts-expect-error webkit
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = fullscreenRef.current;
    if (!el) return;

    try {
      const fsEl = document.fullscreenElement;
      if (fsEl) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      setIsFullscreen(v => !v);
    }
  }, []);

  const exitFullscreenAndClose = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {}
    }
    
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // ---- Navigation
  const goPrev = useCallback(() => setPage(p => clamp(p - 1, 1, numPages || 1)), [numPages]);
  const goNext = useCallback(() => setPage(p => clamp(p + 1, 1, numPages || 1)), [numPages]);

  // ---- Zoom controls
  const zoomIn = useCallback(() => setZoom(z => clamp(Number((z + 0.25).toFixed(2)), 0.5, 3)), []);
  const zoomOut = useCallback(() => setZoom(z => clamp(Number((z - 0.25).toFixed(2)), 0.5, 3)), []);

  const resetView = useCallback(() => {
    setZoom(0.75);
    setRotation(0);
  }, []);

  // ---- Keyboard shortcuts (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (isTyping) return;

      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === 'Escape' && (document.fullscreenElement || isFullscreen)) {
        exitFullscreenAndClose();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, zoomIn, zoomOut, isFullscreen, exitFullscreenAndClose]);

  // ---- Pinch to zoom & Manual Pan
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStart.current = { dist, zoom };
    }
  }, [zoom]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;

    // Manual Pan for normal mode (1 finger)
    if (pointers.current.size === 1 && viewportRef.current) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        
        viewportRef.current.scrollLeft -= dx;
        viewportRef.current.scrollTop -= dy;
    }

    // Update current position for next delta calculation
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch Logic (2 fingers)
    if (pointers.current.size === 2 && pinchStart.current) {
      e.preventDefault();
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / pinchStart.current.dist;
      const next = clamp(pinchStart.current.zoom * ratio, 0.5, 3);
      setZoom(next);
    }
  }, [zoom]);

  const onPointerUpOrCancel = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  }, []);

  // ---- Double tap to zoom
  const lastTap = useRef<number>(0);
  const onDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      setZoom(z => (z < 1.0 ? 1.5 : 0.75)); // Adjust double tap toggles
    }
    lastTap.current = now;
  }, []);

  // ---- Derived width strategy
  const pageWidth = useMemo(() => {
    if (!viewportWidth) return undefined;
    const base = Math.min(viewportWidth, 1100);
    return Math.round(base * zoom);
  }, [viewportWidth, zoom]);

  const canPrev = page > 1;
  const canNext = numPages ? page < numPages : false;

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-slate-100">
      <div
        ref={fullscreenRef}
        className={[
          "bg-slate-100 flex flex-col",
          isFullscreen ? "pdf-fullscreen-active" : "absolute inset-0",
        ].join(" ")}
      >
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-4 h-12 flex items-center justify-between gap-3 z-20 shrink-0 shadow-sm">
          {/* Left: Close Navigation */}
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={exitFullscreenAndClose}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-[#09d8dd] transition-colors"
                aria-label="Retour"
                title="Retour au cours"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Right: Zoom & Page Nav */}
          <div className="flex items-center gap-1">
             {/* Page Nav */}
             <div className="hidden sm:flex items-center gap-1 bg-slate-50 rounded-lg px-1 mr-2 border border-slate-100">
                <button
                  onClick={goPrev}
                  disabled={!canPrev}
                  className="p-1 rounded hover:bg-white disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[10px] font-mono w-12 text-center">
                    {page}/{numPages || '-'}
                </span>
                <button
                  onClick={goNext}
                  disabled={!canNext}
                  className="p-1 rounded hover:bg-white disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
             </div>

            <button onClick={zoomOut} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700" aria-label="Zoom arrière">
              <ZoomOut size={16} />
            </button>

            <span className="text-xs font-bold text-slate-700 w-10 text-center tabular-nums hidden sm:block">
              {Math.round(zoom * 100)}%
            </span>

            <button onClick={zoomIn} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700" aria-label="Zoom avant">
              <ZoomIn size={16} />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1 hidden sm:block" />

            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hidden sm:block"
              aria-label="Rotation"
            >
              <RotateCw size={16} />
            </button>

            <button
              onClick={resetView}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hidden sm:block"
              aria-label="Réinitialiser"
            >
              <RefreshCw size={16} />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1" />

            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-[#09d8dd]"
              aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 relative w-full overflow-hidden bg-slate-200/60">
          {pdfLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <LoadingSpinner />
            </div>
          )}

          {pdfError && (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500 text-sm font-medium">{pdfError}</p>
            </div>
          )}

          {!pdfError && pdfFile && (
            <div
              ref={viewportRef}
              className="w-full h-full relative overflow-auto custom-scrollbar"
            >
              {/* zone pinch : on capte les pointer events */}
              <div
                className="min-h-full min-w-full flex items-center justify-center p-3 sm:p-8"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUpOrCancel}
                onPointerCancel={onPointerUpOrCancel}
                onClick={isMobile ? onDoubleTap : undefined}
                style={{
                  touchAction: 'none',
                }}
              >
                <Document
                  file={pdfFile}
                  loading={null}
                  onLoadSuccess={({ numPages }) => {
                    setNumPages(numPages);
                    setPage(p => clamp(p, 1, numPages));
                  }}
                  onLoadError={() => setPdfError("Impossible de charger le PDF")}
                >
                  <Page
                    pageNumber={page}
                    width={pageWidth}
                    rotate={rotation}
                    renderTextLayer={!isMobile}
                    renderAnnotationLayer={!isMobile}
                    className="shadow-xl bg-white"
                    loading={null}
                  />

                  {/* Pré-rendu léger */}
                  {!isMobile && numPages > 1 && (
                    <div className="absolute opacity-0 pointer-events-none -z-10">
                      {page > 1 && (
                        <Page
                          pageNumber={page - 1}
                          width={pageWidth}
                          rotate={rotation}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          loading={null}
                        />
                      )}
                      {page < numPages && (
                        <Page
                          pageNumber={page + 1}
                          width={pageWidth}
                          rotate={rotation}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          loading={null}
                        />
                      )}
                    </div>
                  )}
                </Document>

                {/* Mobile floating nav */}
                {numPages > 0 && (
                  <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 flex items-center gap-4 border border-slate-200 z-30">
                    <button
                      disabled={!canPrev}
                      onClick={goPrev}
                      className="disabled:opacity-30 hover:text-[#09d8dd]"
                      aria-label="Page précédente"
                    >
                      <ChevronLeft size={22} />
                    </button>

                    <span className="text-xs font-bold text-slate-700 tabular-nums">
                      {page}/{numPages}
                    </span>

                    <button
                      disabled={!canNext}
                      onClick={goNext}
                      className="disabled:opacity-30 hover:text-[#09d8dd]"
                      aria-label="Page suivante"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
