import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAppContext } from "../context/AppContext";
import { imposeFile } from "../lib/imposeFile";
import { COLORS, FONTS } from "../theme";

const SpecRow = ({ label, toolTip, children }) => (
  <Box >
    <Box display="flex" alignItems="center" sx={{ py: 1.25, gap: 1.5 }}>
      <Typography
        sx={{
          fontFamily: FONTS.MONO,
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: COLORS.ink,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          flex: 1,
          borderBottom: `2px dotted ${alpha(COLORS.ink, 0.35)}`,
          transform: "translateY(-2px)",
        }}
      />
      <Box sx={{ flexShrink: 0 }}>{children}</Box>
    </Box>
    <Typography sx={{
        fontFamily: FONTS.MONO,
        fontSize: "0.75rem",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: COLORS.ink
      }}>
        {toolTip}
    </Typography>
  </Box>
);

const CheckboxStamp = ({ checked, onChange }) => (
  <Box
    component="button"
    type="button"
    onClick={onChange}
    sx={{
      width: 26,
      height: 26,
      border: `2px solid ${COLORS.ink}`,
      backgroundColor: checked ? COLORS.pink : COLORS.paper,
      color: COLORS.paper,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: "0.95rem",
      cursor: "pointer",
      padding: 0,
    }}
  >
    {checked ? "✓" : ""}
  </Box>
);

const stepBtnSx = {
  width: 26,
  height: 26,
  border: "none",
  backgroundColor: COLORS.paper,
  color: COLORS.ink,
  fontFamily: FONTS.MONO,
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": { backgroundColor: COLORS.ink, color: COLORS.paper },
  "&:disabled": {
    color: alpha(COLORS.ink, 0.3),
    cursor: "default",
    backgroundColor: COLORS.paper,
  },
};

// used for signatures instead of a dropdown, only goes from 1-4
const Stepper = ({ value, onChange, min, max }) => (
  <Box
    display="flex"
    alignItems="stretch"
    sx={{ border: `2px solid ${COLORS.ink}` }}
  >
    <Box
      component="button"
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      sx={stepBtnSx}
    >
      &minus;
    </Box>
    <Typography
      sx={{
        fontFamily: FONTS.MONO,
        fontWeight: 700,
        fontSize: "0.85rem",
        width: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderLeft: `2px solid ${COLORS.ink}`,
        borderRight: `2px solid ${COLORS.ink}`,
      }}
    >
      {value}
    </Typography>
    <Box
      component="button"
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      sx={stepBtnSx}
    >
      +
    </Box>
  </Box>
);

const segmentedSx = {
  "& .MuiToggleButton-root": {
    py: "2px",
    px: "10px",
    fontSize: "0.7rem",
  },
};

const Controls = () => {
  const fileInputRef = useRef(null);
  const { sharedState, setSharedState } = useAppContext();

  // keeping this separate from sharedState so it doesn't rebuild the whole
  // PDF on every keystroke, only when you click away or hit enter
  const [creepInput, setCreepInput] = useState(
    String(sharedState.creepPerSheetMm),
  );
  useEffect(() => {
    setCreepInput(String(sharedState.creepPerSheetMm));
  }, [sharedState.creepPerSheetMm]);

  const handleOpenButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSharedState({ ...sharedState, origPDF: file });
    }
  };

  // updates one option and rebuilds the booklet, but only if we've
  // already got a file loaded
  const updateImposeOption = async (patch) => {
    const newState = { ...sharedState, ...patch };
    setSharedState(newState);
    if (newState.loaded && newState.origPDF) {
      const foldedPDF = await imposeFile(newState.origPDF, {
        rtl: newState.rtl,
        signatures: newState.signatures,
        padFront: newState.padFront,
        creepPerSheetMm: newState.creepPerSheetMm,
        spreadDetection: newState.spreadDetection,
      });
      setSharedState({ ...newState, foldedPDF });
    }
  };

  const handleRTLChange = (event, value) => {
    if (value) updateImposeOption({ rtl: value === "rtl" });
  };

  const handleSpreadDetectionChange = (event, value) => {
    if (value) updateImposeOption({ spreadDetection: value });
  };

  const handleFrontPaddingToggle = () => {
    updateImposeOption({ padFront: !sharedState.padFront });
  };

  const handleSignaturesChange = (value) => {
    updateImposeOption({ signatures: value });
  };

  const commitCreepChange = () => {
    const value = parseFloat(creepInput);
    const newCreep = Number.isFinite(value) && value >= 0 ? value : 0;
    setCreepInput(String(newCreep));
    if (newCreep !== sharedState.creepPerSheetMm) {
      updateImposeOption({ creepPerSheetMm: newCreep });
    }
  };

  // "download pdf" gets clicked by the user.  adds a anchor
  // to the page and triggers it to start the file download.
  const handleDownloadButtonClick = () => {
    try {
      const url = URL.createObjectURL(sharedState.foldedPDF);
      const link = document.createElement("a");
      link.href = url;
      link.download = "folded-pdf.pdf";
      document.body.appendChild(link);
      link.click();
      // don't leave the link dangling
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating download:", error);
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: FONTS.MONO,
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: COLORS.pink,
          mb: 1,
        }}
      >
        {/* unused title space, only here to keep either side of the
                    flex container vertically aligned at the top */}
        &nbsp;
      </Typography>
      <Box
        sx={{
          border: `2px solid ${COLORS.ink}`,
          mb: 3,
          maxWidth: 560,
          mx: "auto",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, py: 1.5, borderBottom: `2px solid ${COLORS.ink}` }}
        >
          <Typography
            sx={{
              fontFamily: FONTS.MONO,
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: COLORS.blue,
            }}
          >
            Work Order
          </Typography>
          <Button size="small" onClick={handleOpenButtonClick}>
            Open PDF
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            style={{ display: "none" }} // Hide the file input
            accept="application/pdf" // Accept only PDF files
          />
        </Box>

        <Box
          sx={{
            px: 2,
            "& > div:not(:last-of-type)": {
              borderBottom: `1px dashed ${alpha(COLORS.ink, 0.2)}`,
            },
          }}
        >
          <SpecRow label="Reading Order" toolTip="Reading order is left-to-right for most European languages, while right to left is popular in Asian languages">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={sharedState.rtl ? "rtl" : "ltr"}
              onChange={handleRTLChange}
              sx={segmentedSx}
            >
              <ToggleButton value="ltr">LTR</ToggleButton>
              <ToggleButton value="rtl">RTL</ToggleButton>
            </ToggleButtonGroup>
          </SpecRow>

          <SpecRow label="Front Padding" toolTip="Enabling this adds a blank page on page 2.  This effectively offsets all inner pages by one page, which is useful for lining up spreads">
            <CheckboxStamp
              checked={sharedState.padFront}
              onChange={handleFrontPaddingToggle}
            />
          </SpecRow>

          <SpecRow label="Signatures" toolTip="Signatures are the folded 'leaflets' of a book.  One signature can be bound by a staple, but any more requires additional binding">
            <Stepper
              value={sharedState.signatures}
              onChange={handleSignaturesChange}
              min={1}
              max={4}
            />
          </SpecRow>

          <SpecRow label="Creep (mm)" toolTip="With more pages in a signature, the pages will get further out of alignment when they bend around the others in the pamphlet.  Creep
          is an additional amount of space between the pages.  This can allow more pages to be inserted into a signature than would normally look acceptable.">
            <TextField
              size="small"
              type="number"
              variant="outlined"
              inputProps={{
                min: 0,
                step: 0.1,
                style: { textAlign: "right", padding: "6px 8px", width: 48 },
              }}
              value={creepInput}
              onChange={(e) => setCreepInput(e.target.value)}
              onBlur={commitCreepChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.target.blur();
              }}
            />
          </SpecRow>

          <SpecRow label="Spread Detect" toolTip="Sometimes PDFs will be composed with single cover pages, but the inner pages will be twice as wide (a spread).  Imposify attempts to detect this but you can override it with whatever looks better.">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={sharedState.spreadDetection}
              onChange={handleSpreadDetectionChange}
              sx={segmentedSx}
            >
              <ToggleButton value="auto">AUTO</ToggleButton>
              <ToggleButton value="on">ON</ToggleButton>
              <ToggleButton value="off">OFF</ToggleButton>
            </ToggleButtonGroup>
          </SpecRow>
          <Box height="20px"></Box>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: `2px solid ${COLORS.ink}`,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            disabled={!sharedState.loaded}
            onClick={handleDownloadButtonClick}
            sx={{
              backgroundColor: COLORS.pink,
              color: COLORS.paper,
              "&:hover": { backgroundColor: COLORS.ink },
              "&.Mui-disabled": {
                backgroundColor: "transparent",
                color: alpha(COLORS.ink, 0.35),
                border: `2px solid ${alpha(COLORS.ink, 0.25)}`,
              },
            }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Controls;
