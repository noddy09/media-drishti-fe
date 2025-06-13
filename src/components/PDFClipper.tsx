import React, { useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box } from '@mui/material';

// Importing the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Project: Media Drishti

interface PDFClipperProps {
  fileUrl: string;
  onClip: (clip: { x: number; y: number; width: number; height: number }) => void;
  fileType?: 'pdf' | 'image';
}

const PDFClipper: React.FC<PDFClipperProps> = ({ fileUrl, onClip, fileType = 'pdf' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [clipping, setClipping] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 500, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // For PDF thumbnails
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  // Track the rendered height of the PDF page
  const [pageHeight, setPageHeight] = useState<number>(containerSize.height);

  // Generate thumbnails for all pages (PDF only)
  React.useEffect(() => {
    if (fileType !== 'pdf' || !fileUrl) {
      setThumbnails([]);
      return;
    }
    const loadThumbnails = async () => {
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const thumbPromises = Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context!, viewport }).promise;
        return canvas.toDataURL();
      });
      setThumbnails(await Promise.all(thumbPromises));
    };
    loadThumbnails();
  }, [fileUrl, fileType]);

  React.useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [fileUrl]);

  // Adjust main viewer and overlay for sidebar only if thumbnails are present (PDF)
  const mainViewerWidth = thumbnails.length > 0 ? containerSize.width - 120 : containerSize.width;

  // Prevent zoom unless Ctrl is pressed
  const handleWheel = (ref: ReactZoomPanPinchRef, e: WheelEvent) => {
    if (!e.ctrlKey) {
      e.stopPropagation();
    }
  };

  // Prevent overlay from triggering pan/zoom unless Ctrl is pressed
  const handleOverlayWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey) {
      e.stopPropagation();
    }
  };

  // Prevent pan when clipping
  const [disablePan, setDisablePan] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start clipping if left mouse button
    if (e.button !== 0) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setClipping(null);
    setIsDragging(true);
    setDisablePan(true); // Disable pan while clipping
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!start || !isDragging) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClipping({
      x: Math.min(start.x, x),
      y: Math.min(start.y, y),
      width: Math.abs(x - start.x),
      height: Math.abs(y - start.y),
    });
  };

  const handleMouseUp = () => {
    if (clipping && isDragging) {
      onClip(clipping);
    }
    setStart(null);
    setIsDragging(false);
    setDisablePan(false); // Re-enable pan after clipping
  };

  // Callback to get the rendered PDF page height
  const handlePageRenderSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageHeight(viewport.height * (mainViewerWidth / viewport.width));
  };

  // Prevent scrolling to next page by locking scroll range to current page's height
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollBoxRef.current) {
      // Always scroll to top when page changes
      scrollBoxRef.current.scrollTop = 0;
    }
  }, [pageNumber, mainViewerWidth, pageHeight]);

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height: 500, bgcolor: '#222', display: 'flex', flexDirection: 'row' }}>
      {/* Main Viewer */}
      <Box sx={{ flex: 1, position: 'relative', height: 1, overflow: 'hidden' }}>
        <Box
          ref={scrollBoxRef}
          sx={{ width: '100%', height: 500, overflow: 'auto', position: 'relative' }}
        >
          <TransformWrapper
            ref={transformRef}
            panning={{ disabled: disablePan }}
            wheel={{
              disabled: false,
              step: 0.2,
              activationKeys: ['ctrlKey'],
            }}
            onWheel={handleWheel}
          >
            <TransformComponent>
              <Box
                sx={{
                  position: 'relative',
                  width: 'max-content',
                  height: 'max-content',
                  minWidth: '100%',
                  minHeight: 500,
                  // Prevent extra scroll by limiting height to current page
                  maxHeight: fileType === 'pdf' ? pageHeight : undefined,
                  overflow: 'hidden',
                }}
              >
                {fileType === 'pdf' ? (
                  <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    loading={<div>Loading PDF...</div>}
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={mainViewerWidth}
                      onRenderSuccess={handlePageRenderSuccess}
                    />
                  </Document>
                ) : (
                  <img
                    src={fileUrl}
                    alt="Clipping Source"
                    style={{ width: mainViewerWidth, height: containerSize.height, objectFit: 'contain', display: 'block' }}
                    draggable={false}
                  />
                )}
                <Box
                  ref={overlayRef}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: mainViewerWidth,
                    height: fileType === 'pdf' ? pageHeight : containerSize.height,
                    cursor: isDragging ? 'crosshair' : 'pointer',
                    zIndex: 2,
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleOverlayWheel}
                >
                  {clipping && (
                    <Box
                      sx={{
                        position: 'absolute',
                        border: '2px dashed #00f',
                        left: clipping.x,
                        top: clipping.y,
                        width: clipping.width,
                        height: clipping.height,
                        pointerEvents: 'none',
                        background: 'rgba(0,0,255,0.08)',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </TransformComponent>
          </TransformWrapper>
        </Box>
      </Box>
      {/* Thumbnails Sidebar (PDF only) */}
      {fileType === 'pdf' && thumbnails.length > 0 && (
        <Box sx={{ width: 120, height: 500, overflowY: 'auto', bgcolor: '#181818', p: 1, ml: 1, borderRadius: 1 }}>
          {thumbnails.map((thumb, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 1,
                border: pageNumber === idx + 1 ? '2px solid #1976d2' : '2px solid transparent',
                borderRadius: 1,
                cursor: 'pointer',
                overflow: 'hidden',
                background: '#fff',
              }}
              onClick={() => setPageNumber(idx + 1)}
            >
              <img src={thumb} alt={`Page ${idx + 1}`} style={{ width: '100%', display: 'block' }} />
              <Box sx={{ textAlign: 'center', fontSize: 12, color: '#333', py: 0.5 }}>Page {idx + 1}</Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PDFClipper;
