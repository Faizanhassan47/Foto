import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  User,
  Star,
  Tag as TagIcon,
  MessageCircle,
  BarChart3,
  Send,
  Heart,
  Share2,
  Download,
  Sparkles,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api, { getApiError, resolveAssetUrl } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';

/* ── tiny helper ── */
function Avatar({ name, size = 36 }) {
  const initials = (name || 'U').slice(0, 2).toUpperCase();
  const hue = [...(name || 'U')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `hsl(${hue}, 60%, 45%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  );
}

/* ── StarRating interactive row ── */
function StarRow({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <motion.button
            key={star}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            disabled={disabled}
            style={{
              color: filled ? '#f59e0b' : 'var(--text-muted)',
              transition: 'color 0.15s ease',
              background: 'none',
              border: 'none',
              cursor: disabled ? 'default' : 'pointer',
              padding: 0,
            }}
            aria-label={`Rate ${star} stars`}
          >
            <Star size={30} fill={filled ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </motion.button>
        );
      })}
    </div>
  );
}

export function PhotoDetailsPage() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPhoto() {
      setIsLoading(true);
      setError('');
      try {
        const [photoRes, ratingRes] = await Promise.all([
          api.get(`/photos/${photoId}`),
          api.get(`/ratings/photo/${photoId}`),
        ]);
        if (isMounted) {
          setPhoto(photoRes.data.photo);
          setRatingSummary(ratingRes.data.ratings);
          setRatingValue(ratingRes.data.ratings.viewerRating || 5);
        }
      } catch (err) {
        if (isMounted) setError(getApiError(err, 'Unable to load photo details.'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPhoto();
    return () => { isMounted = false; };
  }, [photoId]);

  async function refreshPhoto() {
    const [photoRes, ratingRes] = await Promise.all([
      api.get(`/photos/${photoId}`),
      api.get(`/ratings/photo/${photoId}`),
    ]);
    setPhoto(photoRes.data.photo);
    setRatingSummary(ratingRes.data.ratings);
    setRatingValue(ratingRes.data.ratings.viewerRating || ratingValue);
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    const optimistic = {
      id: `temp-${Date.now()}`,
      text: commentText,
      createdAt: new Date().toISOString(),
      user: { name: user.name, id: user.id },
    };
    setPhoto((prev) => ({ ...prev, comments: [optimistic, ...prev.comments] }));
    setCommentText('');
    try {
      await api.post(`/comments/photo/${photoId}`, { text: optimistic.text });
      await refreshPhoto();
    } catch (err) {
      setPhoto((prev) => ({ ...prev, comments: prev.comments.filter((c) => c.id !== optimistic.id) }));
      setError(getApiError(err, 'Unable to post comment.'));
    }
  }

  async function handleRatingSubmit(newValue) {
    if (!user || user.role !== 'consumer') return;
    const old = ratingValue;
    setRatingValue(newValue);
    setIsSubmittingRating(true);
    try {
      await api.post(`/ratings/photo/${photoId}`, { value: newValue });
      await refreshPhoto();
    } catch (err) {
      setRatingValue(old);
      setError(getApiError(err, 'Unable to save rating.'));
    } finally {
      setIsSubmittingRating(false);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── States ── */
  if (isLoading) {
    return (
      <div className="detail-skeleton">
        <div className="detail-skeleton__img" />
        <div className="detail-skeleton__aside">
          {[80, 50, 100, 60].map((w, i) => (
            <div key={i} className="detail-skeleton__line" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !photo) return <div className="card card--error glass">{error}</div>;
  if (!photo) return (
    <div className="empty-state card glass" style={{ padding: '4rem' }}>
      <h3>Photo not found</h3>
      <p>The requested photo could not be loaded.</p>
    </div>
  );

  const maxCount = Math.max(...(ratingSummary?.distribution?.map((d) => d.count) || [1]), 1);

  return (
    <motion.div
      className="stack-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>{photo.title} | Playwright Island Gallery</title>
        <meta name="description" content={photo.caption || `View this amazing photo from ${photo.eventName}`} />
        <meta property="og:title" content={photo.title} />
        <meta property="og:image" content={resolveAssetUrl(photo.imageUrl)} />
        <meta property="og:description" content={photo.caption || `Event photo from ${photo.eventName}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* ── Back bar ── */}
      <div className="detail-top-bar">
        <Link to="/" className="button button--ghost">
          <ChevronLeft size={18} /> Back to Gallery
        </Link>
        <div className="detail-actions">
          <motion.button
            className="button button--ghost"
            onClick={handleShare}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ gap: '6px', fontSize: '0.9rem' }}
          >
            <Share2 size={16} />
            {copied ? 'Copied!' : 'Share'}
          </motion.button>
        </div>
      </div>

      {error && <div className="card card--error glass">{error}</div>}

      {/* ── Main 2-col layout ── */}
      <section className="detail-layout">

        {/* Left: photo */}
        <motion.div
          className="detail-media"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <img
            src={resolveAssetUrl(photo.imageUrl)}
            alt={photo.title}
            className="detail-image"
          />
        </motion.div>

        {/* Right: info sidebar */}
        <motion.div
          className="detail-sidebar"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >

          {/* ── Info card ── */}
          <div className="detail-card">
            {/* Event badge */}
            {photo.eventName && (
              <div className="detail-event-badge">
                <Sparkles size={13} />
                {photo.eventName}
              </div>
            )}

            <h1 className="detail-title">{photo.title}</h1>

            {photo.caption && (
              <p className="detail-caption">{photo.caption}</p>
            )}

            {/* Meta chips */}
            <div className="detail-meta-row">
              {photo.location && (
                <span className="detail-meta-chip">
                  <MapPin size={14} /> {photo.location}
                </span>
              )}
              {photo.createdAt && (
                <span className="detail-meta-chip">
                  <Calendar size={14} /> {formatDate(photo.createdAt)}
                </span>
              )}
              {photo.uploadedBy?.name && (
                <span className="detail-meta-chip">
                  <User size={14} /> {photo.uploadedBy.name}
                </span>
              )}
            </div>

            {/* Rating summary */}
            <div className="detail-rating-summary">
              <div className="detail-rating-score">
                <Star size={22} fill="#f59e0b" color="#f59e0b" />
                <span className="detail-rating-num">
                  {ratingSummary?.averageRating
                    ? ratingSummary.averageRating.toFixed(1)
                    : '—'}
                </span>
                <span className="detail-rating-count">/ 5 · {ratingSummary?.ratingsCount ?? 0} rating{ratingSummary?.ratingsCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Tags */}
            {photo.tags?.length > 0 && (
              <div className="detail-tags">
                {photo.tags.map((tag) => (
                  <button
                    key={tag}
                    className="photo-tag-btn"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  >
                    <TagIcon size={11} /> {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Rating breakdown card ── */}
          <div className="detail-card">
            <h2 className="detail-section-title">
              <BarChart3 size={18} /> Rating Breakdown
            </h2>

            <div className="rating-breakdown">
              {ratingSummary?.distribution?.map((entry) => (
                <div key={entry.value} className="rating-breakdown__row">
                  <span className="rating-breakdown__label">
                    {entry.value}<Star size={11} fill="currentColor" color="#f59e0b" />
                  </span>
                  <div className="rating-breakdown__track">
                    <motion.div
                      className="rating-breakdown__fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(entry.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                  <span className="rating-breakdown__count">{entry.count}</span>
                </div>
              ))}
            </div>

            {/* Star picker for consumers */}
            {isAuthenticated && user?.role === 'consumer' && (
              <div className="detail-your-rating">
                <p className="detail-your-rating__label">Your Rating</p>
                <StarRow
                  value={ratingValue}
                  onChange={handleRatingSubmit}
                  disabled={isSubmittingRating}
                />
                <AnimatePresence>
                  {isSubmittingRating && (
                    <motion.p
                      className="detail-saving"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Saving…
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!isAuthenticated && (
              <p className="muted" style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link> as a consumer to rate this photo.
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Comments section ── */}
      <motion.section
        className="detail-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <div className="comments-header">
          <div>
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>Community Feedback</p>
            <h2 className="detail-section-title" style={{ marginTop: '0.25rem' }}>
              <MessageCircle size={20} /> Comments
            </h2>
          </div>
          <span className="comments-count-badge">
            {photo.comments.length} reaction{photo.comments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Comment form */}
        {isAuthenticated && user?.role === 'consumer' ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <Avatar name={user.name} />
            <div className="comment-form__field">
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share what stands out in this shot…"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={isSubmittingComment || !commentText.trim()}
                  style={{ fontSize: '0.9rem' }}
                >
                  {isSubmittingComment ? 'Posting…' : <><Send size={15} /> Post</>}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="comment-gate">
            <MessageCircle size={20} style={{ opacity: 0.4 }} />
            <p>
              {isAuthenticated
                ? 'Only consumers can add comments.'
                : <><Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link> as a consumer to join the conversation.</>}
            </p>
          </div>
        )}

        {/* Comment list */}
        <div className="comment-list">
          {!photo.comments.length ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <MessageCircle size={32} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
              <p className="muted">No comments yet — be the first to react!</p>
            </div>
          ) : (
            photo.comments.map((comment, i) => (
              <motion.article
                key={comment.id}
                className="comment-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Avatar name={comment.user?.name} />
                <div className="comment-item__body">
                  <div className="comment-item__meta">
                    <strong>{comment.user?.name || 'Anonymous'}</strong>
                    <span className="comment-item__date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-item__text">{comment.text}</p>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
