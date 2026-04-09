import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getApiError } from '../api/client';

export function UploadPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    caption: '',
    location: '',
    eventName: '',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.title.trim() || !form.location.trim() || !form.eventName.trim()) {
      setError('Title, location, and event name are required.');
      return;
    }

    if (!file) {
      setError('Please choose an image to upload.');
      return;
    }

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('caption', form.caption);
    payload.append('location', form.location);
    payload.append('eventName', form.eventName);
    payload.append('tags', form.tags);
    payload.append('image', file);

    setIsSubmitting(true);

    try {
      const response = await api.post('/photos', payload);

      navigate(`/photos/${response.data.photo.id}`);
    } catch (requestError) {
      setError(getApiError(requestError, 'Upload failed.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="stack-lg">
      <section className="page-header">
        <div>
          <p className="eyebrow">Creator workspace</p>
          <h1>Upload a new event photo.</h1>
        </div>
      </section>

      <section className="card">
        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="two-column">
            <label className="field">
              <span>Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Main stage opener"
              />
            </label>

            <label className="field">
              <span>Event name</span>
              <input
                type="text"
                value={form.eventName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, eventName: event.target.value }))
                }
                placeholder="Summer Beats 2026"
              />
            </label>
          </div>

          <div className="two-column">
            <label className="field">
              <span>Location</span>
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Los Angeles, CA"
              />
            </label>

            <label className="field">
              <span>Tags</span>
              <input
                type="text"
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder="concert, crowd, stage"
              />
            </label>
          </div>

          <label className="field">
            <span>Caption</span>
            <textarea
              rows="4"
              value={form.caption}
              onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))}
              placeholder="Add a short story behind the shot"
            />
          </label>

          <label className="field">
            <span>Image file</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          {error ? <div className="card card--error">{error}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading...' : 'Publish photo'}
          </button>
        </form>
      </section>
    </div>
  );
}
