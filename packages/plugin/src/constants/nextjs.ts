/**
 * @example [helpPageId]
 */
const dynamicSegment = `\\[<camel-case>\\]`;

/**
 * @example [...auth]
 */
const catchAllSegment = `\\[...<camel-case>\\]`;

/**
 * @example [[...auth]]
 */
const optionalCatchAllSegment = `\\[\\[...<camel-case>\\]\\]`;

/**
 * @example (auth)
 */
const routeGroup = `\\(<kebab-case>\\)`;

/**
 * @example @feed
 */
const namedSlot = `\\@<kebab-case>`;

/**
 * @example _components
 */
const privateFolder = `\\_<kebab-case>`;

/**
 * @example rss.xml
 */
const fileWithExtension = `+([a-z])?(.+([a-z]))`;

const appRouterFolders = [
  `<kebab-case>`,
  fileWithExtension,
  dynamicSegment,
  catchAllSegment,
  optionalCatchAllSegment,
  routeGroup,
  namedSlot,
  privateFolder,
];

const pageRouterFiles = [
  `<kebab-case>`,
  `_app`,
  `_document`,
  `404`,
  `500`,
  `_error`,
  `index`,
  dynamicSegment,
  catchAllSegment,
  optionalCatchAllSegment,
];

export const NEXT_JS_APP_ROUTER_FOLDER = `@(${appRouterFolders.join("|")})`;
export const NEXT_JS_PAGE_ROUTER_FILE = `@(${pageRouterFiles.join("|")})`;
