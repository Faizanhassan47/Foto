import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, MapPin, Tag, Type, AlignLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  }, []);

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
    <motion.div 
      className="stack-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <section className="page-header">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)', fontWeight: 700 }}>Creator workspace</p>
          <h1 style={{ fontSize: '3rem' }}>Capture an event.</h1>
          <p className="muted">Upload your best shots and share them with the community.</p>
        </div>
      </section>

      <section className="card glass" style={{ padding: '3rem' }}>
        <form className="stack-lg" onSubmit={handleSubmit}>
          {/* Drag and Drop Zone */}
          <div className="field">
            <span style={{ fontWeight: 600, marginBottom: '1rem', display: 'block' }}>Event Photo</span>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: 'var(--radius-lg)',
                border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border-subtle)'}`,
                background: isDragActive ? 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.05)' : 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="button button--icon glass"
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,0,0,0.1)', color: '#ff4444' }}
                    >
                      <X size={20} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: 'center' }}
                  >
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '50%', 
                      background: 'var(--border-subtle)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      color: 'var(--primary)'
                    }}>
                      <Upload size={32} />
                    </div>
                    <p style={{ fontWeight: 600 }}>Click or drag a photo here</p>
                    <p className="muted" style={{ fontSize: '0.85rem' }}>PNG, JPG or WebP (max. 10MB)</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={16} /> <span>Photo Title</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(c => ({ ...c, title: e.target.value }))}
                placeholder="e.g. Euphoric Finale"
              />
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} /> <span>Event Name</span>
              </label>
              <input
                type="text"
                value={form.eventName}
                onChange={(e) => setForm(c => ({ ...c, eventName: e.target.value }))}
                placeholder="e.g. Ultra Music Festival"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> <span>Location</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(c => ({ ...c, location: e.target.value }))}
                placeholder="e.g. Miami, FL"
              />
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={16} /> <span>Tags</span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm(c => ({ ...c, tags: e.target.value }))}
                placeholder="music, festival, lights"
              />
            </div>
          </div>

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlignLeft size={16} /> <span>Caption</span>
            </label>
            <textarea
              rows="4"
              value={form.caption}
              onChange={(e) => setForm(c => ({ ...c, caption: e.target.value }))}
              placeholder="Tell the story behind this shot..."
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="card card--error"
              style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <button 
              type="submit" 
              className="button button--primary" 
              disabled={isSubmitting}
              style={{ padding: '1rem 3rem' }}
            >
              {isSubmitting ? 'Uploading...' : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Publish Photo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </motion.div>
  );
}
