/**
 * @example [userName]
 */
const routeParam = `\\[<camel-case>\\]`;

/**
 * @example [userName]-profile
 */
const startsWithRouteParam = `${routeParam}-<kebab-case>`;

/**
 * @example follow-[userName]
 */
const endsWithRouteParam = `<kebab-case>-${routeParam}`;

/**
 * @example check-[userName]-profile
 */
const containsRouteParam = `<kebab-case>-${routeParam}-<kebab-case>`;

/**
 * @example [...auth]
 */
const restParam = `\\[...<camel-case>\\]`;

/**
 * @example _components
 */
const privateFolder = `\\_<kebab-case>`;

/**
 * @example rss.xml
 */
const fileWithExtension = `+([a-z])?(.+([a-z]))`;

const routes = [
  `<kebab-case>`,
  "404",
  fileWithExtension,
  routeParam,
  startsWithRouteParam,
  endsWithRouteParam,
  containsRouteParam,
  restParam,
  privateFolder,
];

export const ASTRO_ROUTE = `@(${routes.join("|")})`;
