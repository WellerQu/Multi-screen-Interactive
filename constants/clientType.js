export const ENUM_CLIENT_TYPE = {
    MOBILE: Symbol(1),
    DESKTOP: Symbol(2),
};

export function getClientType(userAgent) {
  let feature = userAgent.toLowerCase();

  if (feature.match(/iphone|android/i)) {
    return ENUM_CLIENT_TYPE.MOBILE;
  } else {
    return ENUM_CLIENT_TYPE.DESKTOP;
  }
};
