
import { GeminiReport } from "./types/geminiReportTypes";

const fallbackReport: GeminiReport = {
  title: "Error Generating Report",
  sections: [{
    title: "Error Information",
    content: "We encountered an error while generating your research report. Please check the error details and try again."
  }],
  references: [],
  suggestedPdfs: [],
  suggestedImages: [],
  suggestedDatasets: []
};

export default fallbackReport;
