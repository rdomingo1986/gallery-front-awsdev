import { PhotoService } from './photoService';
import { MockPhotoService } from './mockPhotoService';

// Detectar si las credenciales de AWS están configuradas
const isAWSConfigured = () => {
  return !!(
    import.meta.env.VITE_AWS_ACCESS_KEY_ID &&
    import.meta.env.VITE_AWS_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_S3_BUCKET_NAME
  );
};

// Exportar el servicio apropiado según la configuración
export const photoService = isAWSConfigured() ? PhotoService : MockPhotoService;

export const isDevelopmentMode = !isAWSConfigured();
