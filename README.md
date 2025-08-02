# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Galería de Fotos

Una aplicación React para gestionar una galería de fotos con almacenamiento en Amazon S3 y descripciones automáticas generadas por Amazon Bedrock (Claude).

## Características

- ✨ Interfaz moderna y responsiva
- 📱 Vista en cuadrícula (4 columnas por fila)
- 📤 Subida de fotos con drag & drop
- 🤖 Generación automática de descripciones con IA (Amazon Bedrock)
- ☁️ Almacenamiento en Amazon S3
- 🔧 Modo desarrollo con datos de ejemplo

## Tecnologías

- React 19 + TypeScript
- Vite
- React Router DOM
- AWS SDK (S3, Bedrock)
- CSS moderno con Grid y Flexbox

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Completa tu archivo `.env.local` con tus credenciales de AWS:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=tu_access_key
VITE_AWS_SECRET_ACCESS_KEY=tu_secret_key
VITE_S3_BUCKET_NAME=tu_bucket_name
```

## Configuración AWS

### S3 Bucket
1. Crea un bucket en S3
2. Configura CORS para permitir acceso desde tu dominio
3. Asegúrate de tener permisos de lectura y escritura

### IAM Permissions
Tu usuario/rol necesita los siguientes permisos:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::tu-bucket-name",
        "arn:aws:s3:::tu-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
    }
  ]
}
```

### Amazon Bedrock
1. Habilita el acceso a Claude 3 Sonnet en tu región
2. Asegúrate de tener permisos para invocar modelos

## Desarrollo

### Iniciar el servidor de desarrollo:
```bash
npm run dev
```

### Modo desarrollo
Si no tienes configuradas las credenciales de AWS, la aplicación automáticamente usará datos de ejemplo para que puedas desarrollar y probar la interfaz.

### Comandos disponibles:
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de la build
npm run lint         # Linter
```

## Estructura del proyecto

```
src/
├── components/           # Componentes React
│   ├── Gallery.tsx      # Vista principal de galería
│   ├── Gallery.css      # Estilos de galería
│   ├── Upload.tsx       # Formulario de subida
│   └── Upload.css       # Estilos de subida
├── services/            # Servicios
│   ├── index.ts         # Configurador de servicios
│   ├── photoService.ts  # Servicio AWS real
│   └── mockPhotoService.ts # Servicio mock para desarrollo
├── types/               # Tipos TypeScript
│   └── index.ts
├── App.tsx             # Componente principal
├── App.css             # Estilos globales
└── main.tsx            # Punto de entrada
```

## Uso

1. **Vista de galería**: Muestra todas tus fotos en una cuadrícula de 4 columnas
2. **Agregar foto**: Haz clic en el botón "+" para subir una nueva foto
3. **Descripción manual**: Escribe tu propia descripción
4. **Descripción IA**: Usa el botón "Generar descripción con IA" para que Claude describa automáticamente tu foto
5. **Subir**: Guarda la foto con su descripción en S3

## Consideraciones de seguridad

⚠️ **Importante**: En producción, no uses credenciales de AWS directamente en variables de entorno del frontend. Considera usar:

- AWS Cognito para autenticación
- IAM Roles para aplicaciones
- API Gateway + Lambda para proxy de requests
- Presigned URLs para subidas directas

## Licencia

MIT

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
