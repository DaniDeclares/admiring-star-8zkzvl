import React, { useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { useNavigate } from "react-router-dom";
import { APP_IMAGES, resolveImageFallback } from "../assets/images.js";
import { buildShopInquiryPath, buildShopInquiryState } from "../lib/shopInquiry.js";
import "./ProductGallery.css";

const productGroups = [
  {
    id: "cheaper-keep-dad-mug",
    title: "Cheaper to Keep Dad Mug",
    images: [
      APP_IMAGES.products.gallery.cheaperKeepDadMug.primary,
      APP_IMAGES.products.gallery.cheaperKeepDadMug.secondary,
      APP_IMAGES.products.gallery.cheaperKeepDadMug.tertiary,
    ],
  },
  {
    id: "dad-documents-sleeve",
    title: "Dad Documents Laptop Sleeve",
    images: [
      APP_IMAGES.products.gallery.dadDocumentsLaptopSleeve.primary,
      APP_IMAGES.products.gallery.dadDocumentsLaptopSleeve.secondary,
      APP_IMAGES.products.gallery.dadDocumentsLaptopSleeve.tertiary,
    ],
  },
];

export default function ProductGallery() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    groupIdx: 0,
    imgIdx: 0,
  });

  const routeProductInquiry = (productName) => {
    navigate(buildShopInquiryPath(productName), {
      state: buildShopInquiryState(productName),
    });
  };

  const openLightbox = (groupIdx, imgIdx) => {
    setLightbox({ isOpen: true, groupIdx, imgIdx });
  };

  const closeLightbox = () => {
    setLightbox((current) => ({ ...current, isOpen: false }));
  };

  const movePrev = () => {
    const group = productGroups[lightbox.groupIdx].images;
    setLightbox((current) => ({
      ...current,
      imgIdx: (current.imgIdx + group.length - 1) % group.length,
    }));
  };

  const moveNext = () => {
    const group = productGroups[lightbox.groupIdx].images;
    setLightbox((current) => ({
      ...current,
      imgIdx: (current.imgIdx + 1) % group.length,
    }));
  };

  return (
    <div className="product-gallery">
      {productGroups.map((group, groupIdx) => (
        <div key={group.id} className="product-card">
          <h2 className="product-title">{group.title}</h2>
          <div className="product-images">
            {group.images.map((imageKey, imgIdx) => (
              <img
                key={`${group.id}-${imgIdx}`}
                src={resolveImageFallback(imageKey)}
                alt={`${group.title} - ${imgIdx + 1}`}
                className="product-image"
                loading="lazy"
                decoding="async"
                onClick={() => openLightbox(groupIdx, imgIdx)}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn btn--primary buy-now-button"
            onClick={() => routeProductInquiry(group.title)}
          >
            Request Custom Quote
          </button>
        </div>
      ))}

      {lightbox.isOpen && (() => {
        const activeImages = productGroups[lightbox.groupIdx]?.images;

        if (!activeImages?.length) {
          return null;
        }

        return (
          <Lightbox
            mainSrc={resolveImageFallback(activeImages[lightbox.imgIdx])}
            nextSrc={resolveImageFallback(activeImages[(lightbox.imgIdx + 1) % activeImages.length])}
            prevSrc={resolveImageFallback(activeImages[(lightbox.imgIdx + activeImages.length - 1) % activeImages.length])}
            onCloseRequest={closeLightbox}
            onMovePrevRequest={movePrev}
            onMoveNextRequest={moveNext}
          />
        );
      })()}
    </div>
  );
}
