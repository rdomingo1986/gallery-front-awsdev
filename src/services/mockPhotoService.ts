import type { Photo, UploadPhotoRequest, BedrockDescriptionResponse } from '../types';

// Servicio mock para desarrollo - simula el comportamiento de AWS
export class MockPhotoService {
  private static photos: Photo[] = [
    // Inicialmente sin fotos - el usuario debe subir las suyas
  ];

  static async getPhotos(): Promise<Photo[]> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [...this.photos];
  }

  static async uploadPhoto({ file, description }: UploadPhotoRequest): Promise<Photo> {
    // Simular latencia de subida
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newPhoto: Photo = {
      id: `mock-${Date.now()}`,
      url: URL.createObjectURL(file),
      description,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    };

    this.photos.unshift(newPhoto);
    return newPhoto;
  }

  static async generateDescription(_imageBase64: string): Promise<BedrockDescriptionResponse> {
    // Simular latencia de IA
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockDescriptions = [
      'Una imagen fascinante que captura un momento único con excelente composición y colores vibrantes.',
      'Fotografía que muestra elementos naturales en armonía, con una iluminación que resalta los detalles importantes.',
      'Composición artística que combina elementos visuales de manera equilibrada, creando una escena atractiva.',
      'Imagen que transmite una sensación de tranquilidad y belleza, con un enfoque cuidadoso en los detalles.',
      'Fotografía que captura la esencia del momento con una perspectiva interesante y colores bien balanceados.',
    ];

    const randomDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];

    return {
      description: randomDescription,
    };
  }

  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }
}
