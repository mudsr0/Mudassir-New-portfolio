import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, ArrowUpRight, BadgeCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import portfolioData from '../data.json'; 

const easeOut = [0.16, 1, 0.3, 1];

const VideoTestimonials = () => {
  const VIDEO_TESTIMONIALS = portfolioData.videoTestimonials || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const featuredRef = useRef(null);
  const scrollRef = useRef(null);

  if (VIDEO_TESTIMONIALS.length === 0) {
    return null; 
  }

  const active = VIDEO_TESTIMONIALS[activeIndex];

  const handleSelect = (idx) => {
    if (idx === activeIndex) {
      setIsPlaying((p) => !p);
      return;
    }
    setActiveIndex(idx);
    setIsPlaying(true);
  };

  // Handle mobile horizontal scroll buttons
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.querySelector('.vtesti-thumb')?.offsetWidth || 280;
      const gap = 12;
      const scrollAmount = (cardWidth + gap) * 1;
      scrollRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      className="section vtesti-section"
      id="video-testimonials"
      ref={featuredRef}
    >
      <div className="vtesti-glow" />
      <div className="vtesti-grid-lines" aria-hidden="true" />

      {/* Header */}
      <motion.div
        className="sec-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: easeOut }}
      >
        <div className="sec-eyebrow">
          <span className="eyebrow-num">05</span>
          Video Testimonials
        </div>
        <h2 className="sec-h">
          Clients in their <em>own words</em>
        </h2>
        <p className="sec-p">
          Don't just take our word for it. Hear directly from the founders,
          designers, and product teams who've shipped exceptional experiences
          with us.
        </p>
      </motion.div>

      {/* Layout */}
      <div className="vtesti-layout">
        {/* Featured Video Player */}
        <motion.div
          className="vtesti-featured"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
        >
          <div className="vtesti-video-frame">
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.iframe
                  key={`iframe-${active.id}`}
                  className="vtesti-iframe"
                  src={active.embedUrl}
                  title={`${active.name} testimonial video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              ) : (
                <motion.div
                  key={`poster-${active.id}`}
                  className="vtesti-poster-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={active.poster}
                    alt={`${active.name} testimonial preview`}
                    className="vtesti-poster"
                    loading="lazy"
                  />
                  <div className="vtesti-poster-overlay" />
                  <div className="vtesti-poster-grain" />

                  <button
                    className="vtesti-play-btn"
                    onClick={() => setIsPlaying(true)}
                    aria-label={`Play ${active.name} testimonial`}
                  >
                    <span className="vtesti-play-icon">
                      <Play size={28} fill="currentColor" />
                    </span>
                    <span className="vtesti-play-ring" />
                    <span className="vtesti-play-ring vtesti-play-ring-2" />
                  </button>

                  <div className="vtesti-frame-corner vtesti-frame-corner-tl" />
                  <div className="vtesti-frame-corner vtesti-frame-corner-br" />

                  <div className="vtesti-duration">
                    <span className="vtesti-duration-dot" />
                    {active.duration}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Featured Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${active.id}`}
              className="vtesti-info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <div className="vtesti-stars">
                {Array.from({ length: active.rating }).map((_, i) => (
                  <Star key={i} size={14} className="star" fill="currentColor" />
                ))}
                <span className="vtesti-rating-text">{active.rating}.0</span>
              </div>

              <p className="vtesti-quote">"{active.quote}"</p>

              <div className="vtesti-author">
                <img
                  src={active.avatar}
                  alt={active.name}
                  className="vtesti-avatar"
                  loading="lazy"
                />
                <div className="vtesti-author-meta">
                  <div className="vtesti-name">{active.name}</div>
                  <div className="vtesti-role">
                    {active.role} <span className="vtesti-company">· {active.company}</span>
                  </div>
                </div>
                <div className="vtesti-badge">
                  <BadgeCheck size={12} />
                  Verified
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Sidebar List */}
        <motion.div
          className="vtesti-list"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.2 }}
        >
          <div className="vtesti-list-label">
            <span>More Stories</span>
            <span className="vtesti-list-count">
              {String(VIDEO_TESTIMONIALS.length).padStart(2, '0')} videos
            </span>
          </div>

          <div className="vtesti-list-scroll" ref={scrollRef}>
            {VIDEO_TESTIMONIALS.map((t, idx) => (
              <motion.button
                key={t.id}
                className={`vtesti-thumb ${idx === activeIndex ? 'is-active' : ''}`}
                onClick={() => handleSelect(idx)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3, ease: easeOut }}
                aria-label={`Select ${t.name} testimonial`}
              >
                {idx === activeIndex && (
                  <motion.span
                    className="vtesti-thumb-active-bar"
                    layoutId="vtesti-active-bar"
                  />
                )}

                <div className="vtesti-thumb-media">
                  <img src={t.poster} alt={t.name} loading="lazy" />
                  <div className="vtesti-thumb-overlay" />
                  <div className="vtesti-thumb-play">
                    <Play size={13} fill="currentColor" />
                  </div>
                  <div className="vtesti-thumb-duration">{t.duration}</div>
                </div>

                <div className="vtesti-thumb-info">
                  <div className="vtesti-thumb-name">{t.name}</div>
                  <div className="vtesti-thumb-role">
                    {t.role} · {t.company}
                  </div>
                  <div className="vtesti-thumb-quote">
                    "{t.quote.slice(0, 64)}..."
                  </div>
                </div>

                <div className="vtesti-thumb-arrow">
                  <ArrowUpRight size={16} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="vtesti-mobile-nav">
            <button
              className="vtesti-nav-btn"
              onClick={() => handleScroll('prev')}
              aria-label="Scroll left"
            >
              <ArrowLeft size={16} />
              Prev
            </button>
            <button
              className="vtesti-nav-btn"
              onClick={() => handleScroll('next')}
              aria-label="Scroll right"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTestimonials;