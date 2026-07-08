import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

export const AppProvider = ({ children }) => {
  const [sharedState, setSharedState] = useState({
    origPDF: null,
    foldedPDF: null,
    pageNumberFolded: 1,
    previewWidth: undefined,
    loaded: false,
    numPagesFolded: null,
    rtl: false, // right-to-left, off by default
    signatures: 1, // number of signatures in booklet
    padFront: false, // shoves a blank page in right after page 1, pushes everything else over by one
    creepPerSheetMm: 0, // the "creep" fix, shifts each sheet in toward the middle a bit
    spreadDetection: 'auto', // auto/on/off, splits pages that look like they're pre-made 2-page spreads
    bleed: false,
    bleedMargin: 3,
    trim: false,
    trimMargin: 3,
  }); // Initial state

  // The value that will be passed to all child components
  const value = { sharedState, setSharedState };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
