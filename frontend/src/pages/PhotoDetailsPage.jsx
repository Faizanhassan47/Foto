import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  User, 
  Star, 
  Tag as TagIcon,
  MessageCircle,
  BarChart3,
  Send
} from 'lucide-react';
import api, { getApiError, resolveAssetUrl } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';

export function PhotoDetailsPage() {
  const { photoId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [ratingValue, setRatingValue] = useState('5');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadPhoto() {
      setIsLoading(true);
      setError('');
      try {
        const [photoResponse, ratingResponse] = await Promise.all([
          api.get(`/photos/${photoId}`),
          api.get(`/ratings/photo/${photoId}`)
        ]);
        if (isMounted) {
          setPhoto(photoResponse.data.photo);
          setRatingSummary(ratingResponse.data.ratings);
          setRatingValue(String(ratingResponse.data.ratings.viewerRating || 5));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiError(requestError, 'Unable to load photo details.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadPhoto();
    return () => { isMounted = false; };
  }, [photoId]);

  async function refreshPhoto() {
    const [photoResponse, ratingResponse] = await Promise.all([
      api.get(`/photos/${photoId}`),
      api.get(`/ratings/photo/${photoId}`)
    ]);
    setPhoto(photoResponse.data.photo);
    setRatingSummary(ratingResponse.data.ratings);
    setRatingValue(String(ratingResponse.data.ratings.viewerRating || ratingValue));
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    setError('');
    try {
      await api.post(`/comments/photo/${photoId}`, { text: commentText });
      setCommentText('');
      await refreshPhoto();
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to post comment.'));
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleRatingSubmit(event) {
    event.preventDefault();
    setIsSubmittingRating(true);
    setError('');
    try {
      await api.post(`/ratings/photo/${photoId}`, { value: Number(ratingValue) });
      await refreshPhoto();
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to save rating.'));
    } finally {
      setIsSubmittingRating(false);
    }
  }

  if (isLoading) {
    return <div className="card glass" style={{ padding: '4rem', textAlign: 'center' }}>Loading photo details...</div>;
  }

  if (error && !photo) {
    return <div className="card card--error glass">{error}</div>;
  }

  if (!photo) {
    return (
      <div className="empty-state card glass" style={{ padding: '4rem' }}>
        <h3>Photo not found</h3>
        <p>The requested photo could not be loaded.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="stack-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link to="/" className="button button--ghost" style={{ width: 'fit-content' }}>
        <ChevronLeft size={18} />
        Back to Gallery
      </Link>

      {error ? <div className="card card--error glass">{error}</div> : null}

      <section className="detail-layout">
        <motion.div 
          className="detail-media card glass"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img src={resolveAssetUrl(photo.imageUrl)} alt={photo.title} className="detail-image" style={{ borderRadius: 'var(--radius-md)' }} />
        </motion.div>

        <motion.div 
          className="detail-sidebar stack-md"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card glass stack-sm" style={{ padding: '2rem' }}>
            <p className="eyebrow" style={{ color: 'var(--accent)', fontWeight: 700 }}>{photo.eventName}</p>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{photo.title}</h1>
            <p className="muted" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>{photo.caption || 'Capture the essence of the moment.'}</p>

            <div className="meta-grid" style={{ gap: '2rem' }}>
              <div className="stack-sm" style={{ gap: '4px' }}>
                <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> Location
                </span>
                <strong style={{ fontSize: '1.1rem' }}>{photo.location}</strong>
              </div>
              <div className="stack-sm" style={{ gap: '4px' }}>
                <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Uploaded
                </span>
                <strong style={{ fontSize: '1.1rem' }}>{formatDate(photo.createdAt)}</strong>
              </div>
              <div className="stack-sm" style={{ gap: '4px' }}>
                <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Creator
                </span>
                <strong style={{ fontSize: '1.1rem' }}>{photo.uploadedBy?.name || 'Unknown'}</strong>
              </div>
              <div className="stack-sm" style={{ gap: '4px' }}>
                <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={14} /> Avg. Rating
                </span>
                <strong style={{ fontSize: '1.1rem' }}>
                  {ratingSummary?.averageRating ? `${ratingSummary.averageRating.toFixed(1)} / 5.0` : 'New'}
                </strong>
              </div>
            </div>

            {photo.tags?.length ? (
              <div className="tag-row" style={{ marginTop: '2rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {photo.tags.map((tag) => (
                  <span key={tag} className="tag" style={{ background: 'var(--border-subtle)', padding: '0.3rem 0.8rem' }}>
                    <TagIcon size={12} style={{ marginRight: '4px' }} />
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="card glass stack-sm" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} />
              Rating Breakdown
            </h2>
            <div className="rating-grid" style={{ margin: '1.5rem 0' }}>
              {ratingSummary?.distribution?.map((entry) => (
                <div key={entry.value} className="rating-row">
                  <span style={{ fontSize: '0.9rem' }}>{entry.value}★</span>
                  <div className="rating-bar" style={{ flex: 1 }}>
                    <motion.div
                      className="rating-bar__fill"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${ratingSummary.ratingsCount ? (entry.count / ratingSummary.ratingsCount) * 100 : 0}%` 
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <strong style={{ minWidth: '20px', textAlign: 'right' }}>{entry.count}</strong>
                </div>
              ))}
            </div>

            {isAuthenticated && user?.role === 'consumer' ? (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <form className="inline-form" onSubmit={handleRatingSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <label className="field" style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>YOUR RATING</span>
                    <select
                      value={ratingValue}
                      onChange={(e) => setRatingValue(e.target.value)}
                      style={{ marginTop: '0.5rem' }}
                    >
                      {[1, 2, 3, 4, 5].map((v) => (
                        <option key={v} value={v}>{v} Stars</option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="button button--primary" disabled={isSubmittingRating}>
                    {isSubmittingRating ? 'Saving...' : 'Rate Now'}
                  </button>
                </form>
              </div>
            ) : null}

            {!isAuthenticated && (
              <p className="muted" style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                Log in as a consumer to rate this photo.
              </p>
            )}
          </div>
        </motion.div>
      </section>

      <section className="card glass stack-md" style={{ padding: '3rem' }}>
        <div className="section-header">
          <div>
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>Community Feedback</p>
            <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageCircle size={24} />
              Comments
            </h2>
          </div>
          <div className="pill glass" style={{ padding: '0.5rem 1rem' }}>{photo.comments.length} Reactions</div>
        </div>

        {isAuthenticated && user?.role === 'consumer' ? (
          <form className="stack-sm" onSubmit={handleCommentSubmit} style={{ background: 'var(--bg-main)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <label className="field">
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Add a comment</span>
              <textarea
                rows="4"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share what stands out in this shot..."
                style={{ marginTop: '0.5rem' }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="button button--primary" disabled={isSubmittingComment}>
                {isSubmittingComment ? 'Posting...' : (
                  <>
                    <Send size={18} />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="card" style={{ background: 'var(--border-subtle)', textAlign: 'center', padding: '2rem' }}>
            <p className="muted">
              {isAuthenticated
                ? 'Only consumers can add comments to photo galleries.'
                : 'Please log in as a consumer to join the conversation.'}
            </p>
          </div>
        )}

        <div className="comment-list" style={{ marginTop: '2rem' }}>
          {!photo.comments.length ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="muted">Zero comments yet. Be the first to react!</p>
            </div>
          ) : (
            photo.comments.map((comment, index) => (
              <motion.article 
                key={comment.id} 
                className="comment-item glass"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                style={{ padding: '1.5rem', marginBottom: '1rem' }}
              >
                <div className="comment-item__meta" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                      {comment.user?.name?.charAt(0) || 'U'}
                    </div>
                    <strong style={{ fontSize: '1rem' }}>{comment.user?.name || 'Unknown User'}</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>{comment.text}</p>
              </motion.article>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
}
