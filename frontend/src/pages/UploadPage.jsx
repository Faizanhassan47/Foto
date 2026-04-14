import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, MapPin, Tag, Type, AlignLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import api, { getApiError } from '../api/client';

export function UploadPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: '',
    eventName: '',
    tags: '',
    caption: ''
  });
  const [files, setFiles] = useState([]); // Array of { file, preview, status: 'pending' | 'uploading' | 'success' | 'error', error: '' }
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const addFiles = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file),
        status: 'pending',
        error: ''
      }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

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
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.location.trim() || !form.eventName.trim()) {
      setError('Location and event name are required for the batch.');
      return;
    }

    if (!files.length) {
      setError('Please add at least one photo.');
      return;
    }

    setIsSubmitting(true);

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      if (currentFile.status === 'success') continue;

      setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'uploading' } : f));

      const payload = new FormData();
      // Use filename as title if none provided
      payload.append('title', currentFile.file.name.replace(/\.[^/.]+$/, "")); 
      payload.append('caption', form.caption);
      payload.append('location', form.location);
      payload.append('eventName', form.eventName);
      payload.append('tags', form.tags);
      payload.append('image', currentFile.file);

      try {
        await api.post('/photos', payload);
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'success' } : f));
        successCount++;
      } catch (requestError) {
        const errMsg = getApiError(requestError, 'Upload failed.');
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error', error: errMsg } : f));
      }
    }

    setIsSubmitting(false);
    
    if (successCount === files.length) {
      navigate('/');
    } else if (successCount > 0) {
      setError(`Uploaded ${successCount} photos. Some failed, please check the list.`);
    }
  }

  return (
    <motion.div 
      className="stack-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <section className="page-header">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)', fontWeight: 700 }}>Creator workspace</p>
          <h1>Bulk Upload.</h1>
          <p className="muted">Upload your entire event reel in seconds. Cloudinary will handle the rest.</p>
        </div>
      </section>

      <section className="card glass upload-card">
        <form className="stack-lg" onSubmit={handleSubmit}>
          {/* Drag and Drop Zone */}
          <div className="field">
            <span style={{ fontWeight: 600, marginBottom: '1rem', display: 'block' }}>Add Photos to Batch</span>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '200px',
                borderRadius: 'var(--radius-lg)',
                border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border-subtle)'}`,
                background: isDragActive ? 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.05)' : 'var(--bg-main)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => addFiles(e.target.files)}
              />
              <Upload size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600 }}>Click or drag multiple photos here</p>
              <p className="muted" style={{ fontSize: '0.85rem' }}>Select as many as you want for this event.</p>
            </div>
          </div>

          {/* Preview Queue */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="upload-queue"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                  gap: '1rem',
                  padding: '1.5rem',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {files.map((f) => (
                  <motion.div 
                    key={f.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
                  >
                    <img src={f.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: f.status === 'uploading' ? 0.5 : 1 }} />
                    
                    {f.status === 'pending' && (
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '24px', height: '24px' }}
                      >
                        <X size={14} />
                      </button>
                    )}

                    {f.status === 'uploading' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <Upload size={24} color="white" />
                        </motion.div>
                      </div>
                    )}

                    {f.status === 'success' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34, 197, 94, 0.4)' }}>
                        <CheckCircle2 size={24} color="white" />
                      </div>
                    )}

                    {f.status === 'error' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.4)' }}>
                        <AlertCircle size={24} color="white" title={f.error} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="batch-metadata" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem' }}>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} /> <span>Shared Event Name</span>
              </label>
              <input
                type="text"
                value={form.eventName}
                onChange={(e) => setForm(c => ({ ...c, eventName: e.target.value }))}
                placeholder="e.g. Coachella 2026"
              />
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> <span>Location</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(c => ({ ...c, location: e.target.value }))}
                placeholder="e.g. Indio, CA"
              />
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={16} /> <span>Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm(c => ({ ...c, tags: e.target.value }))}
                placeholder="music, festival, neon"
              />
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlignLeft size={16} /> <span>Group Caption</span>
              </label>
              <textarea
                rows="1"
                value={form.caption}
                onChange={(e) => setForm(c => ({ ...c, caption: e.target.value }))}
                placeholder="A brief story for this reel..."
              />
            </div>
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
              disabled={isSubmitting || !files.length}
              style={{ padding: '1rem 4rem' }}
            >
              {isSubmitting ? (
                 <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   Uploading {files.filter(f => f.status === 'success').length} / {files.length}...
                 </span>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Publish {files.length ? `${files.length} Photos` : 'Reel'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </motion.div>
  );
}
