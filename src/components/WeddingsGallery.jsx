import React from "react";
import { APP_IMAGES, resolveImageFallback } from "../assets/images.js";
import "../components/WeddingsGallery.css";

const IMAGES = [
  { src: APP_IMAGES.weddings.gallery.barnHangingGlassOrbs, alt: "Hanging glass orb tablescape" },
  { src: APP_IMAGES.weddings.gallery.ivorySofaLounge, alt: "Ivory sofa lounge vignette" },
  { src: APP_IMAGES.weddings.gallery.woodenCoffeeTable, alt: "Wooden coffee table decor" },
  { src: APP_IMAGES.weddings.gallery.rusticOutdoorLoungeOne, alt: "Rustic outdoor lounge #1" },
  { src: APP_IMAGES.weddings.gallery.rusticOutdoorLoungeTwo, alt: "Rustic outdoor lounge #2" },
  { src: APP_IMAGES.weddings.gallery.bohoOutdoorLounge, alt: "Boho outdoor lounge vignette" },
  { src: APP_IMAGES.weddings.gallery.loveMarqueeBarn, alt: "Barn with LOVE marquee sign" },
  { src: APP_IMAGES.weddings.gallery.barnCeilingDrapery, alt: "Barn ceiling drapery & lights" },
];

export default function WeddingsGallery() {
  return (
    <div className="weddings-gallery">
      {IMAGES.map((image) => (
        <div key={image.alt} className="gallery-item">
          <img
            src={resolveImageFallback(image.src)}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
