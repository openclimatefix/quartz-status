export const IndiaBasePath = "/regions/india/data" as const;

export const IndiaDatasBasePath = `${IndiaBasePath}/data` as const;

export const RUVNLSegment = "/ruvnl" as const; // Keep separate to pass to Express router

export const IndiaDataPaths = {
  IndiaDatRUVNLStatusPath: `${IndiaBasePath}${RUVNLSegment}/status` as const
};
