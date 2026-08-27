'use client';
import { useState } from 'react';

export default function Gallery({ images, alt }) {
  const [i, setI] = useState(0);
  return (
    <div className="gallery">
      <div className="main"><img src={images[i]} alt={alt} /></div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, k) => (
            <button key={src + k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={'Foto ' + (k + 1)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
