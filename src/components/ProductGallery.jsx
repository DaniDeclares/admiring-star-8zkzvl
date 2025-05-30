import React, { useState } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import "./ProductGallery.css"; // Ensure this CSS file exists and is styled appropriately

// Sample product data
const productGroups = [
  {
    id: "1970c26d528",
    title: "Empowerment Mug",
    images: [
      "1970c26d528.jpg",
      "1970c26d528 (1).jpg",
      "1970c26d528 (2).jpg",
    ],
    paylink: "https://g3umzm-cq.myshopify.com/products/empowerment-mug",
  },
  {
    id: "1970c273ab8",
    title: "Self-Love Towel",
    images: [
      "1970c273ab8.jpg",
      "1970c273ab8 (1).jpg",
      "1970c273ab8 (2).jpg",
    ],
    paylink: "https://g3umzm-cq.myshopify.com/products/self-love-towel",
  },
  // Add more products as needed
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
    setLightbox({ ...lightbox, isOpen: false });
  };

  const movePrev = () => {
    const group = productGroups[lightbox.groupIdx].images;
    setLightbox({
      ...lightbox,
      imgIdx: (lightbox.imgIdx + group.length - 1) % group.length,
    });
  };

  const moveNext = () => {
    const group = productGroups[lightbox.groupIdx].images;
    setLightbox({
      ...lightbox,
      imgIdx: (lightbox.imgIdx + 1) % group.length,
    });
  };

  return (
    <div className="product-gallery">
      {productGroups.map((group, groupIdx) => (
        <div key={group.id} className="product-card">
          <h2 className="product-title">{group.title}</h2>
          <div className="product-images">
            {group.images.map((img, imgIdx) => (
              <img
                key={imgIdx}
                src={`/images/products/${img}`}
                alt={`${group.title} - ${imgIdx + 1}`}
                className="product-image"
                onClick={() => openLightbox(groupIdx, imgIdx)}
              />
            ))}
          </div>
          <a
            href={group.paylink}
            target="_blank"
            rel="noopener noreferrer"
            className="buy-now-button"
          >
            Buy Now
          </a>
        </div>
      ))}

      {lightbox.isOpen && (
        <Lightbox
          mainSrc={`/images/products/${productGroups[lightbox.groupIdx].images[lightbox.imgIdx]}`}
          nextSrc={`/images/products/${
            productGroups[lightbox.groupIdx].images[
              (lightbox.imgIdx + 1) %
                productGroups[lightbox.groupIdx].images.length
            ]
          }`}
          prevSrc={`/images/products/${
            productGroups[lightbox.groupIdx].images[
              (lightbox.imgIdx +
                productGroups[lightbox.groupIdx].images.length -
                1) %
                productGroups[lightbox.groupIdx].images.length
            ]
          }`}
          onCloseRequest={closeLightbox}
          onMovePrevRequest={movePrev}
          onMoveNextRequest={moveNext}
        />
      )}
    </div>
  );
}
