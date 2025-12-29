import React, { useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box } from '@mui/material';

// Importing the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Project: Media Drishti

interface PDFClipperProps {
  fileUrl: string;
  onClip: (clip: { x: number; y: number; width: number; height: number; overlayWidth: number; overlayHeight: number; pageNumber: number }) => void;
  fileType?: 'pdf' | 'image';
}

const PDFClipper: React.FC<PDFClipperProps> = ({ fileUrl, onClip, fileType = 'pdf' }) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [clipping, setClipping] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 500, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // For PDF thumbnails
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const [originalWidth, setOriginalWidth] = useState<number>(0);
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

  // Reset state when switching documents
  React.useEffect(() => {
    setPageNumber(1);
    setClipping(null);
    setStart(null);
    setIsDragging(false);
    setOriginalWidth(0);
    setPageHeight(containerSize.height);
  }, [fileUrl, fileType, containerSize.height]);

  // Adjust main viewer and overlay for sidebar only if thumbnails are present (PDF)
  const mainViewerWidth = thumbnails.length > 0 ? containerSize.width - 120 : containerSize.width;

  const displayClipping = React.useMemo(() => {
    if (!clipping) return null;
    if (fileType === 'pdf') {
      const renderedScale = originalWidth ? mainViewerWidth / originalWidth : 1;
      return {
        x: clipping.x * renderedScale,
        y: clipping.y * renderedScale,
        width: clipping.width * renderedScale,
        height: clipping.height * renderedScale,
      };
    } else if (imgRef.current) {
      const img = imgRef.current;
      const scale = Math.min(mainViewerWidth / img.naturalWidth, containerSize.height / img.naturalHeight);
      const displayedWidth = img.naturalWidth * scale;
      const displayedHeight = img.naturalHeight * scale;
      const offsetX = (mainViewerWidth - displayedWidth) / 2;
      const offsetY = (containerSize.height - displayedHeight) / 2;
      return {
        x: offsetX + clipping.x * scale,
        y: offsetY + clipping.y * scale,
        width: clipping.width * scale,
        height: clipping.height * scale,
      };
    }
    return clipping;
  }, [clipping, fileType, mainViewerWidth, containerSize.height, originalWidth]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only start clipping if left mouse button
    if (e.button !== 0) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Avoid starting selection before the page/image is measured
    if (fileType === 'pdf' && !originalWidth) return;
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    if (fileType === 'image' && imgRef.current) {
      const img = imgRef.current;
      const scale = Math.min(mainViewerWidth / img.naturalWidth, containerSize.height / img.naturalHeight);
      const displayedWidth = img.naturalWidth * scale;
      const displayedHeight = img.naturalHeight * scale;
      const offsetX = (mainViewerWidth - displayedWidth) / 2;
      const offsetY = (containerSize.height - displayedHeight) / 2;
      const imgX = rx - offsetX;
      const imgY = ry - offsetY;
      if (imgX < 0 || imgY < 0 || imgX > displayedWidth || imgY > displayedHeight) return;
      setStart({ x: imgX / scale, y: imgY / scale });
    } else {
      const renderedScale = mainViewerWidth / originalWidth;
      setStart({ x: rx / renderedScale, y: ry / renderedScale });
    }
    setClipping(null);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!start || !isDragging) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    let currentX: number, currentY: number;
    if (fileType === 'image' && imgRef.current) {
      const img = imgRef.current;
      const scale = Math.min(mainViewerWidth / img.naturalWidth, containerSize.height / img.naturalHeight);
      const displayedWidth = img.naturalWidth * scale;
      const displayedHeight = img.naturalHeight * scale;
      const offsetX = (mainViewerWidth - displayedWidth) / 2;
      const offsetY = (containerSize.height - displayedHeight) / 2;
      const imgX = rx - offsetX;
      const imgY = ry - offsetY;
      currentX = imgX / scale;
      currentY = imgY / scale;
    } else {
      const renderedScale = mainViewerWidth / originalWidth;
      currentX = rx / renderedScale;
      currentY = ry / renderedScale;
    }
    setClipping({
      x: Math.min(start.x, currentX),
      y: Math.min(start.y, currentY),
      width: Math.abs(currentX - start.x),
      height: Math.abs(currentY - start.y),
    });
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (clipping && isDragging) {
      onClip({
        ...clipping,
        overlayWidth: mainViewerWidth,
        overlayHeight: fileType === 'pdf' ? pageHeight : containerSize.height,
        pageNumber,
      });
    }
    setStart(null);
    setIsDragging(false);
  };

  // Callback to get the rendered PDF page height
  const handlePageRenderSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageHeight(viewport.height * (mainViewerWidth / viewport.width));
    setOriginalWidth(viewport.width);
  };

  // Prevent scrolling to next page by locking scroll range to current page's height
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollBoxRef.current) {
      // Always scroll to top when page changes
      scrollBoxRef.current.scrollTop = 0;
    }
    // Clear any in-progress selection when page changes
    setClipping(null);
    setStart(null);
    setIsDragging(false);
  }, [pageNumber, mainViewerWidth, pageHeight]);

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#222', display: 'flex', flexDirection: 'row' }}>
      {/* Main Viewer */}
      <Box sx={{ flex: 1, position: 'relative', height: 1, overflow: 'hidden' }}>
        <Box
          ref={scrollBoxRef}
          sx={{ width: '100%', height: '100%', overflow: 'auto', position: 'relative' }}
        >
          <TransformWrapper
            ref={transformRef}
            panning={{ disabled: true }}
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
                  minHeight: '100%',
                  // Prevent extra scroll by limiting height to current page
                  maxHeight: fileType === 'pdf' ? pageHeight : undefined,
                  overflow: 'hidden',
                }}
              >
                {fileType === 'pdf' ? (
                  <Document file={fileUrl} loading={<div>Loading PDF...</div>}>
                    <Box
                      ref={overlayRef}
                      sx={{
                        position: 'relative',
                        width: mainViewerWidth,
                        height: pageHeight,
                        m: 0,
                        p: 0,
                      }}
                    >
                      <Page
                        pageNumber={pageNumber}
                        width={mainViewerWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="pdf-page"
                        onRenderSuccess={handlePageRenderSuccess}
                      />
                      {/* Overlay on top of the rendered page */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: mainViewerWidth,
                          height: pageHeight,
                          cursor: isDragging ? 'crosshair' : 'pointer',
                          zIndex: 2,
                          touchAction: 'none',
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleMouseDown(e);
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleOverlayWheel}
                      >
                        {displayClipping && (
                          <Box
                            sx={{
                              position: 'absolute',
                              border: '2px dashed #00f',
                              left: displayClipping.x,
                              top: displayClipping.y,
                              width: displayClipping.width,
                              height: displayClipping.height,
                              pointerEvents: 'none',
                              background: 'rgba(0,0,255,0.08)',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Document>
                ) : (
                  <img
                    ref={imgRef}
                    src={fileUrl}
                    alt="Clipping Source"
                    style={{ width: mainViewerWidth, height: containerSize.height, objectFit: 'contain', display: 'block' }}
                    draggable={false}
                  />
                )}
                {/* Image overlay (for image files) */}
                {fileType !== 'pdf' && (
                  <Box
                    ref={overlayRef}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: mainViewerWidth,
                      height: containerSize.height,
                      cursor: isDragging ? 'crosshair' : 'pointer',
                      zIndex: 2,
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleOverlayWheel}
                  >
                    {displayClipping && (
                      <Box
                        sx={{
                          position: 'absolute',
                          border: '2px dashed #00f',
                          left: displayClipping.x,
                          top: displayClipping.y,
                          width: displayClipping.width,
                          height: displayClipping.height,
                          pointerEvents: 'none',
                          background: 'rgba(0,0,255,0.08)',
                        }}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </TransformComponent>
          </TransformWrapper>
        </Box>
      </Box>
      {/* Thumbnails Sidebar (PDF only) */}
      {fileType === 'pdf' && thumbnails.length > 0 && (
        <Box sx={{ width: 120, height: '100%', overflowY: 'auto', bgcolor: '#181818', p: 1, ml: 1, borderRadius: 1 }}>
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
