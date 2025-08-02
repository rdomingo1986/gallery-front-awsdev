import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { photoService, isDevelopmentMode } from '../services';
import type { Photo } from '../types';
import './Gallery.css';

const Gallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const photosData = await photoService.getPhotos();
      setPhotos(photosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando fotos');
    } finally {
      setLoading(false);
    }
  };

  const renderPhotoGrid = () => {
    const grid = [];
    const totalItems = photos.length + 1; // +1 para el botón de agregar
    const rows = Math.ceil(totalItems / 4);

    for (let row = 0; row < rows; row++) {
      const cols = [];
      
      for (let col = 0; col < 4; col++) {
        const index = row * 4 + col;
        
        if (row === 0 && col === 0) {
          // Primera celda siempre es el botón "+"
          cols.push(
            <div key="add-button" className="gallery-cell add-button-cell">
              <Link to="/upload" className="add-button">
                <span className="plus-icon">+</span>
                <span className="add-text">Agregar Foto</span>
              </Link>
            </div>
          );
        } else {
          const photoIndex = index - 1; // -1 porque el primer slot es el botón
          if (photoIndex < photos.length) {
            const photo = photos[photoIndex];
            cols.push(
              <div key={photo.id} className="gallery-cell photo-cell">
                <img 
                  src={photo.url} 
                  alt={photo.description}
                  className="gallery-photo"
                />
                <div className="photo-overlay">
                  <p className="photo-description">{photo.description}</p>
                </div>
              </div>
            );
          } else {
            cols.push(
              <div key={`empty-${index}`} className="gallery-cell empty-cell"></div>
            );
          }
        }
      }
      
      grid.push(
        <div key={`row-${row}`} className="gallery-row">
          {cols}
        </div>
      );
    }

    return grid;
  };

  if (loading) {
    return (
      <div className="gallery-container">
        <div className="loading">Cargando fotos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadPhotos} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <h1>Mi Galería de Fotos</h1>
        <p>
          {photos.length === 0 
            ? "Tu galería está vacía. ¡Comienza agregando tu primera foto!" 
            : `Tienes ${photos.length} foto${photos.length !== 1 ? 's' : ''} en tu galería`
          }
        </p>
        {isDevelopmentMode && (
          <div className="dev-notice">
            🔧 Modo desarrollo - usando datos de ejemplo
          </div>
        )}
      </header>
      
      <div className="gallery-grid">
        {renderPhotoGrid()}
      </div>
    </div>
  );
};

export default Gallery;
