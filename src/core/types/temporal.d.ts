/**
 * Минимальные ambient-типы для Temporal API (TC39 proposal).
 *
 * ЗАЧЕМ ЭТОТ ФАЙЛ: @prisma/orm-postgres 8 (RC) типизирует timestamptz-колонки
 * как Temporal.Instant, но глобального пространства имён Temporal нет ни в
 * стандартной lib TypeScript 5.7, ни в зависимостях Prisma, а отдельный
 * @types/temporal удалён из npm. В рантайме глобал существует (драйвер
 * возвращает настоящие Instant-объекты) — bridging нужен только типам.
 *
 * УДАЛИТЬ ЭТОТ ФАЙЛ, когда TypeScript привезёт lib.esnext.temporal
 * (тогда добавить "ESNext" в lib) или Prisma начнёт поставлять типы сам.
 */
declare namespace Temporal {
  export interface Instant {
    readonly epochMilliseconds: number;
    readonly epochNanoseconds: bigint;
    equals(other: Instant): boolean;
    toString(): string;
    toJSON(): string;
  }
}
