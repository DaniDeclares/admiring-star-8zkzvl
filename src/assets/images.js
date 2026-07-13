import logoPrimary from "./logo/logo-gold-seal.png";
import logoSecondary from "./logo/logo.jpg";
import logoScript from "./logo/logo-script.png";
import heroCoupleBeach from "./hero/hero-couple-beach.jpg";
import heroCoupleBeachWide from "./hero/hero-couple-beach-wide.jpg";
import checkmarkIcon from "./icons/checkmark.svg";
import hoodieTemplate from "./Templates/Gildan18500_UnisexHeavyBlendHoodedSweatshirt_Downloadable_Template.png";
import festivalFacePainting from "./festival-images/istockphoto-147288826-612x612.webp";
import festivalVendorMarket from "./festival-images/istockphoto-1048325338-612x612.webp";
import festivalLiveMusic from "./festival-images/istockphoto-1266364936-612x612.jpg";
import festivalKidZone from "./festival-images/istockphoto-1495159969-612x612.webp";
import festivalWorkshop from "./festival-images/istockphoto-2164186356-612x612.webp";
import festivalFamilyPortrait from "./festival-images/linda-whitney-iYJk_Ama2pw-unsplash.jpg";
import festivalKidsWorkshop from "./festival-images/pexels-kampus-7669176.jpg";
import festivalOutdoorCrowd from "./festival-images/pexels-brett-sayles-1378866.jpg";
import festivalFamilyWalking from "./festival-images/pexels-fang-liu-1996637-3617724 - Copy.jpg";
import festivalNightMarket from "./festival-images/pexels-rahulp9800-7627169.jpg";
import festivalChildVendorOne from "./festival-images/kid entrepenuer 1.jpg";
import festivalChildVendorTwo from "./festival-images/kid entrepenuer 2.jpg";
import festivalChildVendorFour from "./festival-images/kid entrepenuer 4.jpg";
import festivalChildVendorSeven from "./festival-images/kid entreprenuer 7.jpg";
import festivalCommunityPortrait from "./festival-images/pexels-photo-7551751.jpeg";
import festivalStageAudience from "./festival-images/pexels-damla-selen-demir-429137893-32234372.jpg";
import brandingSocialLaunch from "./marketing/ChatGPT Image May 26, 2025, 10_07_17 PM.png";
import brandingCampaignFeature from "./marketing/ChatGPT Image May 30, 2025, 05_48_40 PM.png";
import brandingCreativeBoard from "./marketing/ChatGPT Image May 26, 2025, 06_38_43 PM.png";
import brandingConceptOne from "./marketing/ChatGPT Image May 4, 2025, 11_13_43 AM.png";
import brandingConceptTwo from "./marketing/ChatGPT Image May 26, 2025, 06_39_27 PM.png";
import brandingConceptThree from "./marketing/ChatGPT Image May 25, 2025, 06_20_03 PM.png";
import brandingConceptFour from "./marketing/ChatGPT Image May 4, 2025, 11_13_47 AM.png";
import brandingConceptFive from "./marketing/May 4, 2025, 10_40_09 AM.png";
import brandingConceptSix from "./marketing/ChatGPT Image May 4, 2025, 02_03_07 PM.png";
import brandingConceptSeven from "./marketing/ChatGPT Image May 4, 2025, 10_31_49 AM.png";
import brandingFestivalBackground from "./marketing/festival-bg.jpg";
import brandingFieldFallback from "./marketing/pexels-uriel-mont-6315077.jpg";
import brandingAdministrative from "./marketing/parents-and-two-daughters-in-family-room.jpg";
import brandingSaveTheDate from "./marketing/save-the-date-ig.jpg";

const deepFreeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.getOwnPropertyNames(value).forEach((property) => {
    deepFreeze(value[property]);
  });

  return Object.freeze(value);
};

const IMAGE_MATRIX = {
  logos: {
    primary: logoPrimary,
    secondary: logoSecondary,
    script: logoScript,
  },
  utilities: {
    icons: {
      checkmark: checkmarkIcon,
    },
  },
  products: {
    templates: {
      hoodie: hoodieTemplate,
    },
  },
  branding: {
    hero: {
      coupleBeach: heroCoupleBeach,
      coupleBeachWide: heroCoupleBeachWide,
    },
    social: {
      saveTheDate: brandingSaveTheDate,
      launch: brandingSocialLaunch,
      feature: brandingCampaignFeature,
    },
    campaigns: {
      creativeBoard: brandingCreativeBoard,
      conceptOne: brandingConceptOne,
      conceptTwo: brandingConceptTwo,
      conceptThree: brandingConceptThree,
      conceptFour: brandingConceptFour,
      conceptFive: brandingConceptFive,
      conceptSix: brandingConceptSix,
      conceptSeven: brandingConceptSeven,
    },
    lifestyle: {
      administrative: brandingAdministrative,
      fieldFallback: brandingFieldFallback,
      festivalBackground: brandingFestivalBackground,
    },
  },
  festival: {
    highlights: {
      facePainting: festivalFacePainting,
      vendorMarket: festivalVendorMarket,
      liveMusic: festivalLiveMusic,
      kidZone: festivalKidZone,
    },
    gallery: {
      workshop: festivalWorkshop,
      familyPortrait: festivalFamilyPortrait,
      kidsWorkshop: festivalKidsWorkshop,
      outdoorCrowd: festivalOutdoorCrowd,
      familyWalking: festivalFamilyWalking,
      nightMarket: festivalNightMarket,
      childVendorOne: festivalChildVendorOne,
      childVendorTwo: festivalChildVendorTwo,
      childVendorFour: festivalChildVendorFour,
      childVendorSeven: festivalChildVendorSeven,
      communityPortrait: festivalCommunityPortrait,
      stageAudience: festivalStageAudience,
    },
  },
  divisions: {
    administrative: {
      primary: brandingAdministrative,
      alternate: heroCoupleBeach,
    },
    courier: {
      primary: heroCoupleBeachWide,
      alternate: festivalVendorMarket,
    },
    events: {
      primary: festivalKidZone,
      alternate: brandingFestivalBackground,
    },
    field: {
      primary: brandingFieldFallback,
      alternate: brandingAdministrative,
    },
    government: {
      primary: festivalLiveMusic,
      alternate: brandingFestivalBackground,
    },
    merch: {
      primary: brandingSaveTheDate,
      alternate: hoodieTemplate,
    },
    print: {
      primary: hoodieTemplate,
      alternate: brandingFestivalBackground,
    },
  },
};

export const APP_IMAGES = deepFreeze(IMAGE_MATRIX);

const DEFAULT_FALLBACK_IMAGE = APP_IMAGES?.divisions?.field?.primary ?? heroCoupleBeach;

const toPathSegments = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((segment) => toPathSegments(segment));
  }

  if (typeof value === "string") {
    return value
      .split(".")
      .map((segment) => segment.trim())
      .filter(Boolean);
  }

  return [];
};

export function resolveImageFallback(category, key, fallbackDefault = DEFAULT_FALLBACK_IMAGE) {
  try {
    const pathSegments = [...toPathSegments(category), ...toPathSegments(key)];
    const resolvedImage = pathSegments.reduce(
      (currentNode, segment) => currentNode?.[segment],
      APP_IMAGES,
    );

    if (typeof resolvedImage !== "string" || resolvedImage.trim() === "") {
      throw new Error("Missing image asset");
    }

    return resolvedImage;
  } catch {
    return fallbackDefault ?? DEFAULT_FALLBACK_IMAGE;
  }
}

/*
Example usage:

import { APP_IMAGES, resolveImageFallback } from "./images";

const serviceCards = [
  { id: "field", title: "Field Services", imageKey: "field.primary" },
  { id: "courier", title: "Courier Support", imageKey: "courier.primary" },
];

export function ServiceGrid() {
  return (
    <div className="service-grid">
      {serviceCards.map((card) => (
        <img
          key={card.id}
          src={resolveImageFallback("divisions", card.imageKey, APP_IMAGES.divisions.field.primary)}
          alt={card.title}
          loading="lazy"
        />
      ))}
    </div>
  );
}
*/
