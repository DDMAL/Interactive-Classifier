/**
 * This object contains all of the strings to be used in HTML templates.
 *
 * In the future, we could really easily localize the application by restructuring this object as a string factory
 * that produces strings for the chosen language.
 */
export default {
    siteTitle: "Interactive Classifier",
    submissionWarning: "Your manual corrections will be sent back to Rodan for another round of Gamera classification.  Once the classification is complete, you can make more manual corrections.",
    finalizeText: "Your manual corrections will be sent back to Rodan for a final round of Gamera classification. The results will be saved, and the job will complete.",
    finalizeWarning: "You will not be able to do any more manual corrections!",
    loadingGlyphs: "Loading page glyphs from the server.  This may take some time...",
    menuSubmitLabel: "Submit Corrections and Re-Classify",
    menuFinalizeLabel: "Finalize Classification and Save GameraXML",
    loadingPage: "Loading Page...",
    submitCorrections: "Submit Corrections...",
    finalizeCorrections: "Finalize Corrections...",
    classes: "Classes",
    editGlyphLabel: "Edit Glyph",
    editGlyphDescription: "Click on a Glyph to edit it.",
    // Strings for GlyphEditview
    editGlyph: {
        update: "Update",
        connectedComponent: "Connected Components",
        classLabel: "Class",
        manualID: "Manual ID",
        confidence: "Confidence",
        position: "Position",
        dimensions: "Dimensions",
        glyphPreview: "Glyph Preview"
    },
    glyphMultiEdit: {
        updateAllSelected: "Update All Selected"
    }
};