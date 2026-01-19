export const buildServiceActionPath = (serviceId) => {
  if (!serviceId) {
    return "/book";
  }

  return `/book?service=${serviceId}`;
};
