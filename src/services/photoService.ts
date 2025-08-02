import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import type { Photo, UploadPhotoRequest, BedrockDescriptionResponse } from '../types';

// Configuración AWS - En producción estas deberían venir de variables de entorno
const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
};

const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME || 'gallery-photos-bucket';

const s3Client = new S3Client(AWS_CONFIG);
const bedrockClient = new BedrockRuntimeClient(AWS_CONFIG);

export class PhotoService {
  
  // Obtener todas las fotos del usuario
  static async getPhotos(): Promise<Photo[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'photos/',
      });

      const response = await s3Client.send(command);
      const photos: Photo[] = [];

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key !== 'photos/') {
            const url = await getSignedUrl(s3Client, new GetObjectCommand({
              Bucket: BUCKET_NAME,
              Key: object.Key,
            }), { expiresIn: 3600 });

            // Intentar obtener metadatos con la descripción
            const description = await this.getPhotoDescription(object.Key);

            photos.push({
              id: object.Key,
              url,
              description,
              filename: object.Key.split('/').pop() || '',
              uploadedAt: object.LastModified?.toISOString() || '',
            });
          }
        }
      }

      return photos;
    } catch (error) {
      console.error('Error obteniendo fotos:', error);
      throw new Error('No se pudieron cargar las fotos');
    }
  }

  // Subir una foto a S3
  static async uploadPhoto({ file, description }: UploadPhotoRequest): Promise<Photo> {
    try {
      const key = `photos/${Date.now()}-${file.name}`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: file.type,
        Metadata: {
          description: description,
        },
      });

      await s3Client.send(command);

      // Obtener URL firmada para mostrar la imagen
      const url = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }), { expiresIn: 3600 });

      return {
        id: key,
        url,
        description,
        filename: file.name,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error subiendo foto:', error);
      throw new Error('No se pudo subir la foto');
    }
  }

  // Obtener descripción usando Amazon Bedrock (Claude)
  static async generateDescription(imageBase64: string): Promise<BedrockDescriptionResponse> {
    try {
      const prompt = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64
                }
              },
              {
                type: "text",
                text: "Describe esta imagen de manera concisa y descriptiva en español. Menciona los elementos principales, colores, ambiente y cualquier detalle relevante."
              }
            ]
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        body: JSON.stringify(prompt),
        contentType: "application/json",
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return {
        description: responseBody.content[0].text,
      };
    } catch (error) {
      console.error('Error generando descripción:', error);
      throw new Error('No se pudo generar la descripción automática');
    }
  }

  // Obtener descripción de una foto existente
  private static async getPhotoDescription(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      return response.Metadata?.description || 'Sin descripción';
    } catch (error) {
      console.error('Error obteniendo descripción:', error);
      return 'Sin descripción';
    }
  }

  // Convertir archivo a base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remover el prefijo data:image/...;base64,
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }
}
