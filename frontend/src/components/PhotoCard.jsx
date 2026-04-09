import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, MessageSquare, Star, Tag, Maximize2 } from 'lucide-react';
import { resolveAssetUrl } from '../api/client';
import { formatDate } from '../utils/formatDate';

export function PhotoCard({ photo, onExpand }) {
  return (
    <motion.article 
      className="photo-card card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="photo-card__media">
        <motion.img 
          src={resolveAssetUrl(photo.imageUrl)} 
          alt={photo.title} 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }} className="photo-overlay" />

        <button 
          onClick={() => onExpand(photo)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}
          className="button button--icon glass photo-card-expand"
        >
          <Maximize2 size={24} />
        </button>

        <div className="glass" style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.4rem 0.8rem',
          borderRadius: '99px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Star size={14} fill={photo.averageRating ? "currentColor" : "none"} />
          <span>{photo.averageRating ? photo.averageRating.toFixed(1) : 'New'}</span>
        </div>
      </div>

      <div className="photo-card__body">
        <Link to={`/photos/${photo.id}`}>
        <div className="photo-card__heading">
          <div>
            <p className="eyebrow" style={{ color: 'var(--accent)', fontWeight: 700 }}>{photo.eventName}</p>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{photo.title}</h3>
          </div>
        </div>

        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {photo.caption || 'Capture the essence of the moment with this stunning event coverage.'}
        </p>

        <div className="stack-sm" style={{ gap: '0.8rem' }}>
          <div className="meta-row" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {photo.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} /> {formatDate(photo.createdAt)}
            </span>
          </div>

          <div className="meta-row" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={14} /> {photo.commentsCount}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} /> {photo.ratingsCount} ratings
            </span>
          </div>
        </div>

        {photo.tags?.length ? (
          <div className="tag-row" style={{ marginTop: '1.2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {photo.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag" style={{ 
                fontSize: '0.75rem', 
                background: 'var(--border-subtle)', 
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        ) : null}
        </Link>
      </div>
    </motion.article>
  );
}
