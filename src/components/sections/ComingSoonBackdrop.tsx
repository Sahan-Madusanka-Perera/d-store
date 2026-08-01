'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Looping AMV backdrop for the pre-launch splash.
 *
 * The footage is bright, high-contrast anime with white flash frames, so it can never
 * be shown raw behind copy. Two things tame it: the video itself is dimmed by a filter
 * (multiplicative, so a flash frame scales down with everything else instead of
 * blowing out), and the splash paints its own scrim over the middle. See
 * src/app/coming-soon/page.tsx for the second half of that.
 *
 * Nothing here is load-bearing — if the video is blocked, still decoding, or refused
 * (iOS Low Power Mode rejects autoplay), the poster stays up and the page reads the
 * same. That is also why the <video> only mounts once the client has opted in:
 * visitors who asked for reduced motion, or who are on a metered connection, never
 * spend 4MB finding out they did not want it.
 */

const POSTER = '/coming-soon/backdrop-poster.webp';

// Caps the flash frames. Deliberately no blur: softening a full-screen video costs a
// GPU pass on every one of the 24 frames a second, and it renders black outright where
// the compositor falls back to software. The encode's denoise pass already took the
// edge off the compression, so the blur was buying very little. This belongs to the
// footage, so the poster wears it too and swapping one for the other is invisible.
const FOOTAGE_FILTER = 'brightness(0.72) saturate(1.12)';

type FrugalConnection = { saveData?: boolean; effectiveType?: string };

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function backdropWelcome() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const connection = (navigator as Navigator & { connection?: FrugalConnection }).connection;
  if (connection?.saveData === true) return false;

  return !/(^|\W)[23]g$/.test(connection?.effectiveType ?? '');
}

export default function ComingSoonBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoplayRefused, setAutoplayRefused] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Server and first paint both answer "poster only", so the markup matches on
  // hydration and the video is a considered second step rather than a default.
  const welcome = useSyncExternalStore(subscribeToMotionPreference, backdropWelcome, () => false);
  const showVideo = welcome && !autoplayRefused;

  useEffect(() => {
    if (!showVideo) return;
    videoRef.current?.play().catch((error: DOMException) => {
      // An AbortError only means the play was interrupted — the element is still
      // healthy and will carry on. Tearing the video out for that would strand the
      // page on the poster over nothing; only a real refusal should do that.
      if (error.name !== 'AbortError') setAutoplayRefused(true);
    });
  }, [showVideo]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Held under the video too, so the crossfade at mount resolves against a frame
          rather than against nothing. */}
      <Image
        src={POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ filter: FOOTAGE_FILTER }}
      />

      {showVideo && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter: FOOTAGE_FILTER }}
        >
          <source src="/coming-soon/backdrop.webm" type="video/webm" />
          <source src="/coming-soon/backdrop.mp4" type="video/mp4" />
        </video>
      )}

      {/* Flat floor across the whole frame, then a heavier wash top and bottom so the
          cyan hairline and the footer line keep a dark seat regardless of the shot. */}
      <div className="absolute inset-0 bg-black/25" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 22%, rgba(0,0,0,0.10) 70%, rgba(0,0,0,0.72) 100%)',
        }}
      />
    </div>
  );
}
