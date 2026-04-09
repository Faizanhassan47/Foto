import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Info } from 'lucide-react';
import { resolveAssetUrl } from '../api/client';

export function Lightbox({ photo, onClose }) {
  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="lightbox-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="lightbox-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="lightbox-close" onClick={onClose}>
            <X size={24} />
          </button>

          <img
            src={resolveAssetUrl(photo.imageUrl)}
            alt={photo.title}
            className="lightbox-image"
          />

          <div className="lightbox-meta">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{photo.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={14} /> {photo.eventName}
              </span>
              <span>•</span>
              <span>{photo.location}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
