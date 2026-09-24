import type { FieldOutputTypes, models } from '../contract.js';

export type UserWithRelations = (typeof models)['public']['User'];
export type StoreWithRelations = (typeof models)['public']['Store'];

export type PlainUser = FieldOutputTypes['public']['User'];
export type PlainStore = FieldOutputTypes['public']['Store'];
