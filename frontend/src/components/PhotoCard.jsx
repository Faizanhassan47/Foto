import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../api/client';
import { formatDate } from '../utils/formatDate';

export function PhotoCard({ photo }) {
  return (
    <article className="photo-card">
      <Link to={`/photos/${photo.id}`} className="photo-card__media">
        <img src={resolveAssetUrl(photo.imageUrl)} alt={photo.title} />
      </Link>

      <div className="photo-card__body">
        <div className="photo-card__heading">
          <div>
            <p className="eyebrow">{photo.eventName}</p>
            <h3>{photo.title}</h3>
          </div>
          <span className="pill">{photo.averageRating ? `${photo.averageRating}/5` : 'New'}</span>
        </div>

        <p className="muted">{photo.caption || 'Fresh event coverage ready to explore.'}</p>

        <div className="meta-row">
          <span>{photo.location}</span>
          <span>{formatDate(photo.createdAt)}</span>
        </div>

        <div className="meta-row">
          <span>{photo.commentsCount} comments</span>
          <span>{photo.ratingsCount} ratings</span>
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
    </article>
  );
}
