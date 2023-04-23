export enum eAppEnv {
  DEVELOPMENT = 1,
  STAGING = 2,
  PRODUCTION = 3,
}

export function getEnvironment(): eAppEnv {
  switch (process.env.NODE_ENV) {
    case "development":
      return eAppEnv.DEVELOPMENT;
    case "test":
      return eAppEnv.STAGING;
    case "production":
      return eAppEnv.PRODUCTION;
    default:
      throw Error(`Invalid NODE_ENV '${process.env.NODE_ENV}' encountered`);
  }
}

export function isDevelopment(): boolean {
  return getEnvironment() === eAppEnv.DEVELOPMENT;
}

export function getAPIBaseURL(): string {
  return process.env.REACT_APP_API_BASE_URL!;
}

export function getBaseURL(): string {
  return process.env.REACT_APP_SITE_BASE_URL!;
}
