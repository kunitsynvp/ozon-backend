/**
 * Статусы подключения магазина к Ozon.
 * Значения зеркалят фронтендовый OzonStatus (ozon-frontend/src/types/statuses.ts) —
 * строки это общий контракт, менять только с обеих сторон.
 */
export const OzonStatus = {
  Connected: 'connected',
  AuthError: 'authError',
  Unavailable: 'unavailable',
  ReconnectionRequired: 'reconnectionRequired',
} as const;

export type OzonStatusType = (typeof OzonStatus)[keyof typeof OzonStatus];
