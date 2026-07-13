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
  homepage: {
    visuals: {
      documentSupport: "/images/stock/document execution office.jpg",
      eventServices: "/weddings/FloralWedding_Couple_GoldChairs.jpg",
      governmentSupport: "/images/stock/Courthouse steps.jpg",
    },
  },
  products: {
    templates: {
      hoodie: hoodieTemplate,
    },
    gallery: {
      cheaperKeepDadMug: {
        primary: "/images/products/Cheaper to Keep Dad Mug1.jpg",
        secondary: "/images/products/Cheaper to Keep Dad Mug2.jpg",
        tertiary: "/images/products/Cheaper to Keep Dad Mug3.jpg",
      },
      dadDocumentsLaptopSleeve: {
        primary: "/images/products/Dad Documents Laptop Sleeve1.jpg",
        secondary: "/images/products/Dad Documents Laptop Sleeve2.jpg",
        tertiary: "/images/products/Dad Documents Laptop Sleeve3.jpg",
      },
    },
    shop: {
      cheaperToKeepDadMug: "/images/products/cheaper-to-keep-dad-mug/13417731404300332877_2048.jpg",
      signedSealedDadliveredGlassMug: "/images/products/signed-sealed-dadlivered-glass-mug/13417731404300332877_2048_800.jpg",
      licenseToDadMug: "/images/products/license-to-dad-mug/13673897199289775117_2048_800.jpg",
      licenseToDadBeachTowel: "/images/products/license-to-dad-beach-towel/10363092619905953242_2048.jpg",
      cheaperToKeepDadBeachTowel: "/images/products/cheaper-to-keep-dad-beach-towel/9879137063207955309_2048_800x.jpg",
      grillSergeantBeachTowel: "/images/products/grill-sergeant-beach-towel/9879137063207955309_2048_800x.jpg",
      officialDadDocumentsToteBag: "/images/products/official-dad-documents-tote-bag/11901353032387740085_2048_800x800.jpg",
      dadDocumentsLaptopSleeve: "/images/products/dad-documents-laptop-sleeve/11010138353168134045_2048_800x800.jpg",
      declareYourWorthTee: "/images/products/declare-your-worth-tee/11901353032387740085_2048_800x800.jpg",
      heartfeltDadUnisexTee: "/images/products/heartfelt-dad-unisex-tee/9375045573264734471_2048.jpg",
      dadDocumentsLaptopSleeveAlt: "/images/products/dad-documents-laptop-sleeve/404397518277071714_2048_800x800.jpg",
      unisexGarmentDyedTshirt: "/images/products/unisex-garment-dyed-tshirt/CPxzKdjZLCfK73jMmEVThn.jpg",
      dadsBeachTowelLicenseToDad: "/images/products/dads-beach-towel-license-to-dad/UYEy6AHSqBbqNquao85NoK.jpg",
      declareYourWorthEbook: "/images/products/declare-your-worth-ebook.png",
      businessPlannerDigital: "/images/products/business-planner-digital.png",
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
  events: {
    gallery: {
      floralCoupleGoldChairs: "/weddings/FloralWedding_Couple_GoldChairs.jpg",
      lakefrontCeremonySetup: "/weddings/LakefrontWedding_CeremonySetup.jpg",
      mansionKissUmbrella: "/weddings/MansionWedding_Kiss_Umbrella.jpg",
      barnCeilingDrapery: "/weddings/barn-ceiling-drapery.jpg",
      mountainBrideBouquet: "/weddings/MountainBride_CircleArch_Bouquet.jpg",
      rusticReceptionTable: "/weddings/rustic-barn-wedding-reception-with-greenery-on-wooden-table.jpg",
    },
  },
  festival: {
    heroBackground: "/images/festival/festival-crowd-01.jpg",
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
  weddings: {
    gallery: {
      barnHangingGlassOrbs: "/weddings/barn-hanging-glass-orbs.jpg",
      ivorySofaLounge: "/weddings/ivory-sofa-lounge.jpg",
      woodenCoffeeTable: "/weddings/wooden-coffee-table.jpg",
      rusticOutdoorLoungeOne: "/weddings/rustic-outdoor-lounge-1.jpg",
      rusticOutdoorLoungeTwo: "/weddings/rustic-outdoor-lounge-2.jpg",
      bohoOutdoorLounge: "/weddings/boho-outdoor-lounge.jpg",
      loveMarqueeBarn: "/weddings/love-marquee-barn.jpg",
      barnCeilingDrapery: "/weddings/barn-ceiling-drapery.jpg",
      floralCoupleGoldChairs: "/weddings/FloralWedding_Couple_GoldChairs.jpg",
      lakefrontCeremonySetup: "/weddings/LakefrontWedding_CeremonySetup.jpg",
      mansionKissUmbrella: "/weddings/MansionWedding_Kiss_Umbrella.jpg",
      mountainBrideBouquet: "/weddings/MountainBride_CircleArch_Bouquet.jpg",
      rusticReceptionTable: "/weddings/rustic-barn-wedding-reception-with-greenery-on-wooden-table.jpg",
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

/**
 * Treat direct asset URLs and public-folder file paths as already-resolved image sources.
 * Examples: "/images/example.jpg" and "https://cdn.example.com/example.png".
 */
const looksLikeAssetPath = (value) => (
  typeof value === "string"
  && (value.startsWith("/") || /^https?:\/\//i.test(value))
  && /\.[a-z0-9]+($|[?#])/i.test(value)
);

/**
 * Resolve an image from APP_IMAGES using a dotted path or path segments.
 * When only a direct asset path is supplied, that path is returned unchanged.
 */
export function resolveImageFallback(category, key, fallbackDefault = DEFAULT_FALLBACK_IMAGE) {
  try {
    if (key == null && looksLikeAssetPath(category)) {
      return category;
    }

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
