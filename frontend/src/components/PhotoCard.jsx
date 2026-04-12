import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, MessageSquare, Star, Tag, Maximize2 } from 'lucide-react';
import { resolveAssetUrl } from '../api/client';
import { formatDate } from '../utils/formatDate';

export function PhotoCard({ photo, onExpand, onTagClick }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  // Smart Cloudinary URLs
  const thumbUrl = resolveAssetUrl(photo.imageUrl, {
    width: 600,
    crop: 'fill',
    gravity: 'auto',
  });

  const blurUrl = resolveAssetUrl(photo.imageUrl, {
    width: 30,
    blur: 1000,
    quality: 10,
  });

  function handleTagClick(e, tag) {
    e.preventDefault();
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    } else {
      navigate(`/search?q=${encodeURIComponent(tag)}`);
    }
  }

  return (
    <motion.article
      className="photo-card card"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
    >
      {/* ── Image (clickable to expand) ── */}
      <div
        className="photo-card__media"
        onClick={() => onExpand?.(photo)}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        aria-label={`Expand photo: ${photo.title}`}
        onKeyDown={(e) => e.key === 'Enter' && onExpand?.(photo)}
      >
        {/* Blur placeholder */}
        {!isLoaded && (
          <img
            src={blurUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(10px)',
              transform: 'scale(1.1)',
            }}
          />
        )}

        <motion.img
          src={thumbUrl}
          alt={photo.title}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />

        {/* Hover overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
          className="photo-overlay"
        />

        {/* Expand icon (kept for discoverability) */}
        <button
          onClick={(e) => { e.stopPropagation(); onExpand?.(photo); }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            transition: 'all 0.3s ease',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
          }}
          className="button button--icon glass photo-card-expand"
          aria-label="Expand"
        >
          <Maximize2 size={22} />
        </button>

        {/* Rating badge */}
        <div
          className="glass"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.35rem 0.7rem',
            borderRadius: '99px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <Star size={13} fill={photo.averageRating ? 'currentColor' : 'none'} />
          <span>{photo.averageRating ? photo.averageRating.toFixed(1) : 'New'}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="photo-card__body">
        <Link to={`/photos/${photo.id}`}>
          <div className="photo-card__heading">
            <p className="eyebrow" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {photo.eventName}
            </p>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{photo.title}</h3>
          </div>

          <p
            className="muted"
            style={{
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {photo.caption || 'Capture the essence of the moment.'}
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            {photo.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> {photo.location}
              </span>
            )}
            {photo.createdAt && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> {formatDate(photo.createdAt)}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={13} /> {photo.commentsCount ?? 0}
            </span>
          </div>
        </Link>

        {/* Tags — clickable */}
        {photo.tags?.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {photo.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={(e) => handleTagClick(e, tag)}
                className="photo-tag-btn"
              >
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
