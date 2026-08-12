import React, { useState } from "react";
import "./ProductGallery.css";

const productGroups = [
  {
    id: "1970c26d528",
    title: "Empowerment Mug",
    images: [
      "1970c26d528.jpg",
      "1970c26d528 (1).jpg",
      "1970c26d528 (2).jpg",
    ],
    paylink:
      "https://g3umzm-cq.myshopify.com/products/empowerment-mug",
  },
  {
    id: "1970c273ab8",
    title: "Self-Love Towel",
    images: [
      "1970c273ab8.jpg",
      "1970c273ab8 (1).jpg",
      "1970c273ab8 (2).jpg",
    ],
    paylink:
      "https://g3umzm-cq.myshopify.com/products/self-love-towel",
  },
];

export default function ProductGallery() {
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    groupIdx: 0,
    imgIdx: 0,
  });

  const openLightbox = (groupIdx, imgIdx) => {
    setLightbox({ isOpen: true, groupIdx, imgIdx });
  };

  const closeLightbox = () => {
    setLightbox((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  const movePrev = () => {
    setLightbox((current) => {
      const images = productGroups[current.groupIdx]?.images || [];

      if (!images.length) return current;

      return {
        ...current,
        imgIdx:
          (current.imgIdx - 1 + images.length) % images.length,
      };
    });
  };

  const moveNext = () => {
    setLightbox((current) => {
      const images = productGroups[current.groupIdx]?.images || [];

      if (!images.length) return current;

      return {
        ...current,
        imgIdx: (current.imgIdx + 1) % images.length,
      };
    });
  };

  const activeGroup = productGroups[lightbox.groupIdx];
  const activeImage = activeGroup?.images?.[lightbox.imgIdx];

  return (
    <div className="product-gallery">
      {productGroups.map((group, groupIdx) => (
        <div key={group.id} className="product-card">
          <h2 className="product-title">{group.title}</h2>

          <div className="product-images">
            {group.images.map((img, imgIdx) => (
              <img
                key={img}
                src={`/images/products/${img}`}
                alt={`${group.title} - ${imgIdx + 1}`}
                className="product-image"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src =
                    `${process.env.PUBLIC_URL || ""}/images/festival/festival-crowd-01.jpg`;
                }}
                onClick={() => openLightbox(groupIdx, imgIdx)}
              />
            ))}
          </div>

          <a
            href={group.paylink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary buy-now-button"
          >
            Buy Now
          </a>
        </div>
      ))}

      {lightbox.isOpen && activeGroup && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeGroup.title} image viewer`}
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.85)",
            padding: "2rem",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "1000px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <img
              src={`/images/products/${activeImage}`}
              alt={`${activeGroup.title} - ${lightbox.imgIdx + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />

            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close image viewer"
              style={{
                position: "absolute",
                top: "-1rem",
                right: "-1rem",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
            >
              ×
            </button>

            {activeGroup.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={movePrev}
                  aria-label="Previous image"
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={moveNext}
                  aria-label="Next image"
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
