import React from "react";
import "../components/WeddingsGallery.css";

const IMAGES = [
  { src: require("../images/weddings/barn-hanging-glass-orbs.jpg"), alt: "Hanging glass orb tablescape" },
  { src: require("../images/weddings/ivory-sofa-lounge.jpg"),       alt: "Ivory sofa lounge vignette"    },
  { src: require("../images/weddings/wooden-coffee-table.jpg"),     alt: "Wooden coffee table decor"     },
  { src: require("../images/weddings/rustic-outdoor-lounge-1.jpg"), alt: "Rustic outdoor lounge #1"      },
  { src: require("../images/weddings/rustic-outdoor-lounge-2.jpg"), alt: "Rustic outdoor lounge #2"      },
  { src: require("../images/weddings/boho-outdoor-lounge.jpg"),     alt: "Boho outdoor lounge vignette"  },
  { src: require("../images/weddings/love-marquee-barn.jpg"),       alt: "Barn with LOVE marquee sign"   },
  { src: require("../images/weddings/barn-ceiling-drapery.jpg"),    alt: "Barn ceiling drapery & lights" },
];

export default function WeddingsGallery() {
  return (
    <div className="weddings-gallery">
      {IMAGES.map((img, idx) => (
        <div key={idx} className="gallery-item">
          <img src={img.src} alt={img.alt} />
        </div>
      ))}
    </div>
  );
}
