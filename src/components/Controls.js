import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    ToggleButton,
} from "@mui/material";
import { useAppContext } from '../context/AppContext';
import { imposeFile } from '../lib/imposeFile';


const Controls = () => {
    // Create a ref to store the file input element
    const fileInputRef = useRef(null);
    const { sharedState, setSharedState } = useAppContext();

    // keeping this separate from sharedState so it doesn't rebuild the whole
    // PDF on every keystroke, only when you click away or hit enter
    const [creepInput, setCreepInput] = useState(String(sharedState.creepPerSheetMm));
    useEffect(() => {
        setCreepInput(String(sharedState.creepPerSheetMm));
    }, [sharedState.creepPerSheetMm]);

    const handleOpenButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSharedState({...sharedState, origPDF: file});
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

    const handleSignaturesChange = (event) => {
        const newSignatures = parseInt(event.target.value, 10) || 1;
        updateImposeOption({ signatures: newSignatures });
    };

    const handleSpreadDetectionChange = (event) => {
        updateImposeOption({ spreadDetection: event.target.value });
    };

    const handleFrontPaddingToggle = () => {
        updateImposeOption({ padFront: !sharedState.padFront });
    };

    const handleRTLToggle = () => {
        updateImposeOption({ rtl: !sharedState.rtl });
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
        <Box display="flex" flexDirection="column" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
            <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" gap={1}>
                <Button variant="outlined" onClick={handleOpenButtonClick}>Open PDF</Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    style={{ display: "none" }} // Hide the file input
                    accept="application/pdf" // Accept only PDF files
                />
                <Button variant="outlined" disabled={!sharedState.loaded} onClick={handleDownloadButtonClick}>
                    Download PDF
                </Button>
            </Box>

            <Divider flexItem sx={{ borderColor: 'rgba(144, 238, 144, 0.2)', width: '100%', maxWidth: 480 }} />

            <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" gap={1.5}>
                <ToggleButton value="rtl" size="small" selected={sharedState.rtl} onChange={handleRTLToggle}>
                    Right-to-Left
                </ToggleButton>
                <ToggleButton value="padFront" size="small" selected={sharedState.padFront} onChange={handleFrontPaddingToggle}>
                    Front Padding
                </ToggleButton>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="signatures-label">Signatures</InputLabel>
                    <Select
                        labelId="signatures-label"
                        label="Signatures"
                        value={sharedState.signatures}
                        onChange={handleSignaturesChange}
                    >
                        <MenuItem value={1}>1 (Single)</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    size="small"
                    type="number"
                    label="Creep per sheet (mm)"
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ width: 170 }}
                    value={creepInput}
                    onChange={(e) => setCreepInput(e.target.value)}
                    onBlur={commitCreepChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="spread-detection-label">Spread Detection</InputLabel>
                    <Select
                        labelId="spread-detection-label"
                        label="Spread Detection"
                        value={sharedState.spreadDetection}
                        onChange={handleSpreadDetectionChange}
                    >
                        <MenuItem value="auto">Auto</MenuItem>
                        <MenuItem value="on">On</MenuItem>
                        <MenuItem value="off">Off</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

export default Controls;