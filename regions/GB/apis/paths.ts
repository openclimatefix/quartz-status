export const GBBasePath = "/regions/GB" as const;

export const GBAPIsBasePath = `${GBBasePath}/apis` as const;

export const GBNationalSegment = "/national" as const; // Keep separate to pass to Express router
export const GBNationalApiBasePath = `${GBAPIsBasePath}${GBNationalSegment}` as const;

export const GBSitesSegment = "/sites" as const; // Keep separate to pass to Express router
export const GBSitesApiBasePath = `${GBAPIsBasePath}${GBSitesSegment}` as const;

export const GBAPIPaths = {
  GBNationalStatusPath: `${GBNationalApiBasePath}/status` as const,
  GBNationalRecentForecastPath: `${GBNationalApiBasePath}/recent-forecast` as const,

  GBSitesStatusPath: `${GBSitesApiBasePath}/status` as const
};
