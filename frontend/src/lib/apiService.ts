const API_BASE_URL = 'http://localhost:5000';

export interface EditResumeRequest { resume: string; job_description: string; }
export interface EditResumeResponse { tailored_resume: string; }
export interface ExtractJobRequest { url: string; }
export interface ExtractJobResponse { job_description: string; raw_job_description: string; }
export interface FitScoreRequest { resume: string; job_description: string; }
export interface FitScoreResponse { score: number; label: string; explanation: string; }
export interface ApiError { error: string; }

function callViaBackground(endpoint: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'API_REQUEST', endpoint, payload },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response?.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'API call failed'));
        }
      }
    );
  });
}

export class ApiService {
  static async extractJob(request: ExtractJobRequest): Promise<ExtractJobResponse> {
    return callViaBackground('/extract-job', request);
  }

  static async editResume(request: EditResumeRequest): Promise<EditResumeResponse> {
    return callViaBackground('/edit-resume', request);
  }

  static async fitScore(request: FitScoreRequest): Promise<FitScoreResponse> {
    return callViaBackground('/fit-score', request);
  }

  static async uploadResume(file: File, jobDescription: string): Promise<EditResumeResponse> {
  // Convert file to Base64 to send via message passing
  const base64File = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  return callViaBackground('/upload-resume', {
    file: base64File,
    job_description: jobDescription,
    fileName: file.name
  });
}
}
