import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Calendar, Tag, Star, MessageSquare,
  ExternalLink, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { resolveAssetUrl } from '../api/client';
import { formatDate } from '../utils/formatDate';

export function Lightbox({ photo, photos = [], onClose, onNavigate }) {
  const navigate = useNavigate();

  // Current index within the photos array
  const currentIndex = photos.findIndex((p) => p.id === photo?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(photos[currentIndex - 1]);
  }, [hasPrev, currentIndex, photos, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(photos[currentIndex + 1]);
  }, [hasNext, currentIndex, photos, onNavigate]);

  // Keyboard: Escape = close, ← → = navigate
  useEffect(() => {
    if (!photo) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photo, onClose, goPrev, goNext]);

  // Lock body scroll
  useEffect(() => {
    if (photo) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [photo]);

  // Sync URL with open photo (#8)
  useEffect(() => {
    if (photo) {
      navigate(`/photos/${photo.id}`, { replace: true });
    }
  }, [photo?.id]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="pin-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="pin-modal"
            key={photo.id}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Left: Image ── */}
            <div className="pin-modal__image-wrap">
              <img
                src={resolveAssetUrl(photo.imageUrl, { width: 900, quality: 90 })}
                alt={photo.title}
                className="pin-modal__image"
              />

              {/* Prev / Next arrows */}
              {hasPrev && (
                <button
                  className="pin-modal__arrow pin-modal__arrow--left"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              {hasNext && (
                <button
                  className="pin-modal__arrow pin-modal__arrow--right"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  aria-label="Next photo"
                >
                  <ChevronRight size={22} />
                </button>
              )}

              {/* Counter pill */}
              {photos.length > 1 && (
                <div className="pin-modal__counter">
                  {currentIndex + 1} / {photos.length}
                </div>
              )}
            </div>

            {/* ── Right: Details ── */}
            <div className="pin-modal__details">
              {/* Close */}
              <button className="pin-modal__close" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>

              {/* Header */}
              <div className="pin-modal__header">
                {photo.eventName && (
                  <span className="pin-modal__event">{photo.eventName}</span>
                )}
                <h2 className="pin-modal__title">{photo.title}</h2>
              </div>

              {/* Stats row */}
              <div className="pin-modal__stats">
                <span>
                  <Star size={14} fill={photo.averageRating ? 'currentColor' : 'none'} />
                  {photo.averageRating ? photo.averageRating.toFixed(1) : 'No rating'}
                </span>
                <span>·</span>
                <span>
                  <MessageSquare size={14} />
                  {photo.commentsCount ?? 0} comment{photo.commentsCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Caption */}
              {photo.caption && (
                <p className="pin-modal__caption">{photo.caption}</p>
              )}

              {/* Meta info */}
              <ul className="pin-modal__meta">
                {photo.location && (
                  <li>
                    <MapPin size={15} />
                    <span>{photo.location}</span>
                  </li>
                )}
                {photo.createdAt && (
                  <li>
                    <Calendar size={15} />
                    <span>{formatDate(photo.createdAt)}</span>
                  </li>
                )}
              </ul>

              {/* Tags */}
              {photo.tags?.length > 0 && (
                <div className="pin-modal__tags">
                  {photo.tags.map((tag) => (
                    <button
                      key={tag}
                      className="pin-modal__tag"
                      onClick={() => {
                        onClose();
                        navigate(`/search?q=${encodeURIComponent(tag)}`);
                      }}
                    >
                      <Tag size={11} /> {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Link
                to={`/photos/${photo.id}`}
                className="button button--primary pin-modal__cta"
                onClick={onClose}
              >
                <ExternalLink size={16} />
                View full page
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
