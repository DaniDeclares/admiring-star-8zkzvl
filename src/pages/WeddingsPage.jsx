// src/components/WeddingsGallery.jsx
import React from "react";
import "./WeddingsGallery.css";

const images = [
  "barn-ceiling-drapery.jpg",
  "barn-hanging-glass-orbs.jpg",
  "BlueChina_Bridesmaids_Fireplace.jpg",
  "BlueChina_Bride_Silhouette_Window.jpg",
  "BlueChina_WeddingParty_BlackWhite.jpg",
  "boho-outdoor-lounge.jpg",
  "Bride_Mom_Veil_Prep.jpg",
  "FloralWedding_Couple_GoldChairs.jpg",
  "FloralWedding_Groomsmen_BlueSuits.jpg",
  "GoldenWedding_CoupleCloseUp.jpg",
  "ivory-sofa-lounge.jpg",
  "LakefrontWedding_BridalGuest_RedDress.jpg",
  "LakefrontWedding_CeremonySetup.jpg",
  "LakefrontWedding_Officiant_Podium.jpg",
  "love-marquee-barn.jpg",
  "MansionWedding_Bride_Portrait.jpg",
  "MansionWedding_CoupleOnStairs.jpg",
  "MansionWedding_FamilyStaircase.jpg",
  "MansionWedding_FirstLook.jpg",
  "MansionWedding_Kiss_Umbrella.jpg",
  "MansionWedding_RingsMiddleFinger.jpg",
  "MilitaryWedding_AisleWalk.jpg",
  "MilitaryWedding_FamilyPortrait.jpg",
  "MilitaryWedding_FirstLook.jpg",
  "MilitaryWedding_PewMoment.jpg",
  "MilitaryWedding_WeddingParty.jpg",
  "MountainBride_CircleArch_Bouquet.jpg",
  "MountainBride_CircleArch_FacingBouquet.jpg",
  "MountainBride_CircleArch_HoldingTrain.jpg",
  "pexels-amar-10288373.jpg",
  "pexels-dziana-hasanbekava-6401686.jpg",
  "pexels-panditwiguna-2788491.jpg",
  "pexels-quang-nguyen-vinh-222549-2175614.jpg",
  "pexels-rachel-claire-5490145.jpg",
  "pexels-soner-gorkem-9756539-6119578.jpg",
  "pexels-ufuk-hambarduzu-2828991-7862462.jpg",
  "rustic-barn-wedding-reception-with-greenery-on-wooden-table.jpg",
  "rustic-outdoor-lounge-1.jpg",
  "rustic-outdoor-lounge-2.jpg",
  "VintageCar_BrideGroom_BouquetKiss.jpg",
  "VintageCar_BrideGroom_Kiss.jpg",
  "WeddingDress_Hanging_Archway.jpg",
  "wooden-coffee-table.jpg",
];

export default function WeddingsGallery() {
  return (
    <div className="gallery-grid">
      {images.map((img, i) => (
        <div className="gallery-img-wrapper" key={i}>
          <img
            src={`/images/weddings/${img}`}
            alt={`Wedding gallery photo ${i + 1}`}
            className="gallery-img"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
