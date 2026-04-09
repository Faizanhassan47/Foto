import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

    return () => {
      isMounted = false;
    };
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

    if (!commentText.trim()) {
      return;
    }

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
    return <div className="card">Loading photo details...</div>;
  }

  if (error && !photo) {
    return <div className="card card--error">{error}</div>;
  }

  if (!photo) {
    return (
      <div className="empty-state">
        <h3>Photo not found</h3>
        <p>The requested photo could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <Link to="/" className="text-link">
        Back to gallery
      </Link>

      {error ? <div className="card card--error">{error}</div> : null}

      <section className="detail-layout">
        <div className="detail-media card">
          <img src={resolveAssetUrl(photo.imageUrl)} alt={photo.title} className="detail-image" />
        </div>

        <div className="detail-sidebar stack-md">
          <div className="card stack-sm">
            <p className="eyebrow">{photo.eventName}</p>
            <h1>{photo.title}</h1>
            <p className="muted">{photo.caption || 'No caption provided for this upload.'}</p>

            <div className="meta-grid">
              <div>
                <span className="meta-label">Location</span>
                <strong>{photo.location}</strong>
              </div>
              <div>
                <span className="meta-label">Uploaded</span>
                <strong>{formatDate(photo.createdAt)}</strong>
              </div>
              <div>
                <span className="meta-label">Creator</span>
                <strong>{photo.uploadedBy?.name || 'Unknown creator'}</strong>
              </div>
              <div>
                <span className="meta-label">Rating</span>
                <strong>
                  {ratingSummary?.averageRating ? `${ratingSummary.averageRating}/5` : 'No ratings yet'}
                </strong>
              </div>
            </div>

            {photo.tags?.length ? (
              <div className="tag-row">
                {photo.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="card stack-sm">
            <h2>Rating breakdown</h2>
            <div className="rating-grid">
              {ratingSummary?.distribution?.map((entry) => (
                <div key={entry.value} className="rating-row">
                  <span>{entry.value}/5</span>
                  <div className="rating-bar">
                    <div
                      className="rating-bar__fill"
                      style={{
                        width: `${ratingSummary.ratingsCount ? (entry.count / ratingSummary.ratingsCount) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <strong>{entry.count}</strong>
                </div>
              ))}
            </div>

            {isAuthenticated && user?.role === 'consumer' ? (
              <form className="inline-form" onSubmit={handleRatingSubmit}>
                <label className="field">
                  <span>Your rating</span>
                  <select
                    value={ratingValue}
                    onChange={(event) => setRatingValue(event.target.value)}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="button" disabled={isSubmittingRating}>
                  {isSubmittingRating ? 'Saving...' : 'Save rating'}
                </button>
              </form>
            ) : null}

            {!isAuthenticated ? (
              <p className="muted">Log in as a consumer to rate this photo.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card stack-md">
        <div className="section-header">
          <div>
            <p className="eyebrow">Conversation</p>
            <h2>Comments</h2>
          </div>
          <span className="pill">{photo.comments.length}</span>
        </div>

        {isAuthenticated && user?.role === 'consumer' ? (
          <form className="stack-sm" onSubmit={handleCommentSubmit}>
            <label className="field">
              <span>Add a comment</span>
              <textarea
                rows="4"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Share what stands out in this shot"
              />
            </label>
            <button type="submit" className="button" disabled={isSubmittingComment}>
              {isSubmittingComment ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p className="muted">
            {isAuthenticated
              ? 'Only consumers can add comments in this workflow.'
              : 'Log in as a consumer to join the conversation.'}
          </p>
        )}

        {!photo.comments.length ? (
          <div className="empty-state empty-state--compact">
            <h3>No comments yet</h3>
            <p>Be the first person to react to this upload.</p>
          </div>
        ) : (
          <div className="comment-list">
            {photo.comments.map((comment) => (
              <article key={comment.id} className="comment-item">
                <div className="comment-item__meta">
                  <strong>{comment.user?.name || 'Unknown user'}</strong>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p>{comment.text}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
