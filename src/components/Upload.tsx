import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { photoService, isDevelopmentMode } from '../services';
import './Upload.css';

const Upload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedFile) return;

    try {
      setIsGeneratingDescription(true);
      setError(null);

      const base64 = await photoService.fileToBase64(selectedFile);
      const response = await photoService.generateDescription(base64);
      setDescription(response.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando descripción');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) {
      setError('Por favor selecciona una imagen y agrega una descripción');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      await photoService.uploadPhoto({
        file: selectedFile,
        description: description.trim(),
      });

      // Redirigir a la galería después de subir
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo la foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Simular la selección de archivo
      if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
        setSelectedFile(file);
        setError(null);

        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Archivo inválido. Selecciona una imagen de máximo 10MB');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="upload-container">
      <header className="upload-header">
        <Link to="/" className="back-button">
          ← Volver a la Galería
        </Link>
        <h1>Subir Nueva Foto</h1>
        {isDevelopmentMode && (
          <div className="dev-notice">
            🔧 Modo desarrollo - la foto se guardará localmente
          </div>
        )}
      </header>

      <div className="upload-content">
        {!selectedFile ? (
          <div 
            className="file-drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="drop-zone-content">
              <div className="upload-icon">📷</div>
              <h3>Arrastra tu foto aquí o haz clic para seleccionar</h3>
              <p>Formatos soportados: JPG, PNG, GIF (máximo 10MB)</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                Seleccionar Archivo
              </label>
            </div>
          </div>
        ) : (
          <div className="upload-form">
            <div className="image-preview-section">
              <div className="image-preview">
                <img src={imagePreview!} alt="Preview" className="preview-image" />
              </div>
              <div className="image-info">
                <p><strong>Archivo:</strong> {selectedFile.name}</p>
                <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                    setDescription('');
                    setError(null);
                  }}
                  className="change-image-button"
                >
                  Cambiar Imagen
                </button>
              </div>
            </div>

            <div className="description-section">
              <label htmlFor="description" className="description-label">
                Descripción de la foto
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escribe una descripción de tu foto..."
                className="description-textarea"
                rows={4}
              />
              
              <div className="action-buttons">
                <button
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription}
                  className="generate-button"
                >
                  {isGeneratingDescription ? (
                    <>
                      <span className="spinner"></span>
                      Generando descripción...
                    </>
                  ) : (
                    '🤖 Generar descripción con IA'
                  )}
                </button>

                <button
                  onClick={handleUpload}
                  disabled={isUploading || !description.trim()}
                  className="upload-button"
                >
                  {isUploading ? (
                    <>
                      <span className="spinner"></span>
                      Subiendo...
                    </>
                  ) : (
                    '📤 Subir Foto'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
