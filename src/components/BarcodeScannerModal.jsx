// src/components/BarcodeScannerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Barcode,
  Sparkles,
  Search,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAppContext } from '../context/AppContext';
import { lookupUpcBarcode, VERIFIED_UPC_CATALOG } from '../utils/nutrientEngine';

export default function BarcodeScannerModal() {
  const { isScannerOpen, setIsScannerOpen, logStackToDaily } = useAppContext();

  const [manualUpc, setManualUpc] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scannerError, setScannerError] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'allin-upc-camera-viewport';

  useEffect(() => {
    if (!isScannerOpen) {
      stopCameraScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setScannerError(null);
        await new Promise((r) => setTimeout(r, 200));
        const el = document.getElementById(scannerContainerId);
        if (!el || !isMounted) return;

        const html5QrCode = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 230, height: 140 },
            aspectRatio: 1.5,
          },
          (decodedText) => {
            if (decodedText) {
              handleResolveBarcode(decodedText);
            }
          },
          () => {}
        );
      } catch {
        if (isMounted) {
          setScannerError(
            'Camera stream unavailable or permission denied. Use the UPC input or Quick-Scan presets below.'
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopCameraScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerOpen]);

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // Ignore cleanup errors
      }
      html5QrCodeRef.current = null;
    }
  };

  const handleResolveBarcode = async (code) => {
    const clean = String(code).trim();
    if (!clean) return;
    setIsLookingUp(true);
    setScannerError(null);
    const result = await lookupUpcBarcode(clean);
    setIsLookingUp(false);

    if (result) {
      setManualUpc(clean);
      setScannedProduct(result);
      stopCameraScanner();
    }
  };

  const handleConfirmLog = () => {
    if (!scannedProduct) return;
    logStackToDaily(scannedProduct, scannedProduct.productName);
    setLoggedSuccess(true);
    setTimeout(() => {
      setLoggedSuccess(false);
      handleClose();
    }, 900);
  };

  const handleClose = () => {
    stopCameraScanner();
    setScannedProduct(null);
    setManualUpc('');
    setScannerError(null);
    setIsScannerOpen(false);
  };

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-white/15 rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                UPC / EAN Barcode Camera Scanner
              </h3>
              <p className="text-[10px] text-slate-400">
                Open Food Facts API v2 + Verified Clinical Fallback
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          {/* Camera Viewfinder with Target Reticle */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/15 min-h-[175px] flex items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-56 h-28 border-2 border-emerald-400/85 rounded-2xl relative shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-300 rounded-tl-md" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-300 rounded-tr-md" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-300 rounded-bl-md" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-300 rounded-br-md" />
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
              </div>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Align UPC Barcode inside Reticle
              </span>
            </div>

            {isLookingUp && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 z-10">
                <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                <span className="text-xs font-bold text-emerald-300">
                  Querying Open Food Facts UPC Database...
                </span>
              </div>
            )}
          </div>

          {scannerError && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Direct UPC Lookup Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Enter or Scan UPC / EAN Code
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualUpc}
                onChange={(e) => setManualUpc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleResolveBarcode(manualUpc);
                  }
                }}
                placeholder="e.g. 068100084245 (Oikos) or any product UPC..."
                className="flex-1 rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs font-bold text-white"
              />
              <button
                type="button"
                onClick={() => handleResolveBarcode(manualUpc)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lookup UPC</span>
              </button>
            </div>
          </div>

          {/* Quick-Scan Verified Staple Barcodes */}
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Quick-Scan Verified Staple UPCs:
            </span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(VERIFIED_UPC_CATALOG).map(([upc, info]) => (
                <button
                  key={upc}
                  type="button"
                  onClick={() => handleResolveBarcode(upc)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-[10px] font-bold text-slate-300 hover:text-emerald-200 transition flex items-center gap-1"
                >
                  <Barcode className="w-3 h-3 text-emerald-400" />
                  <span>{info.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scanned Product Result & Auto-Populate Card */}
          {scannedProduct && (
            <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/40 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">
                    ✓ {scannedProduct.source}
                  </span>
                  <h4 className="text-xs font-black text-white">{scannedProduct.productName}</h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {scannedProduct.servingGrams}g serving
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                  <div className="text-[8px] text-slate-400 font-bold">Kcal</div>
                  <div className="text-xs font-black text-white">{scannedProduct.calories}</div>
                </div>
                <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                  <div className="text-[8px] text-slate-400 font-bold">Protein</div>
                  <div className="text-xs font-black text-emerald-400">{scannedProduct.protein}g</div>
                </div>
                <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                  <div className="text-[8px] text-slate-400 font-bold">Carbs</div>
                  <div className="text-xs font-black text-cyan-300">{scannedProduct.carbs}g</div>
                </div>
                <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                  <div className="text-[8px] text-slate-400 font-bold">Net Carb</div>
                  <div className="text-xs font-black text-teal-300">{scannedProduct.netCarbs}g</div>
                </div>
                <div className="bg-slate-950/90 rounded-xl p-1.5 border border-white/10">
                  <div className="text-[8px] text-slate-400 font-bold">Fats</div>
                  <div className="text-xs font-black text-amber-300">{scannedProduct.fats}g</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmLog}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
              >
                {loggedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Auto-Populated into Today&apos;s Nutrition Log!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Populate Today&apos;s Nutrition Log</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
