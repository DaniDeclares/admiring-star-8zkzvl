export const SHOP_INQUIRY_SERVICE_NEEDED = "Merchandise Printing";

export const buildShopInquiryNotes = (productName) => (
  `Inquiry regarding custom printing for: ${productName}`
);

export const buildShopInquiryPath = (productName) => {
  const targetPackage = encodeURIComponent(productName);

  return `/request-service?source=shop&package=${targetPackage}`;
};

export const buildShopInquiryState = (productName) => ({
  serviceNeeded: SHOP_INQUIRY_SERVICE_NEEDED,
  notes: buildShopInquiryNotes(productName),
});
