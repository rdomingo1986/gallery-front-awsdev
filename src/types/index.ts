export interface Photo {
  id: string;
  url: string;
  description: string;
  filename: string;
  uploadedAt: string;
}

export interface UploadPhotoRequest {
  file: File;
  description: string;
}

export interface BedrockDescriptionResponse {
  description: string;
}
