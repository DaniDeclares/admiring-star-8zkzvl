export const buildServiceActionPath = (serviceId, action = "book") => {
  if (!serviceId) {
    return action === "pay" ? "/pay" : "/book";
  }

  return action === "pay" ? `/pay?service=${serviceId}` : `/book?service=${serviceId}`;
};
