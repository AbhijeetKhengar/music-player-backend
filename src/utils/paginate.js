export const paginate = (query, { page = 1, limit = 10 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return query.skip(skip).limit(parseInt(limit));
};
