import { Factory } from './factory';

export type ExtractOrganizationType<ClassType> =
  ClassType extends Factory<any, any, any, any, infer ExtractedType, any, any, any, any, any>
    ? ExtractedType
    : never
;

export type ExtractOrganizationPropsType<ClassType> =
  ClassType extends Factory<any, any, any, infer ExtractedType, any, any, any, any, any, any>
    ? ExtractedType
    : never
;

export type ExtractPersonType<ClassType> =
  ClassType extends Factory<any, any, any, any, any, any, infer ExtractedType, any, any, any>
    ? ExtractedType
    : never
;

export type ExtractPersonPropsType<ClassType> =
  ClassType extends Factory<any, any, any, any, any, infer ExtractedType, any, any, any, any>
    ? ExtractedType
    : never
;

export type ExtractPersonKeyType<ClassType> =
  ClassType extends Factory<infer ExtractedType, any, any, any, any, any, any, any, any, any>
    ? ExtractedType
    : never
;

export type ExtractTeamType<ClassType> =
  ClassType extends Factory<any, any, any, any, any, any, any, any, infer ExtractedType, any>
    ? ExtractedType
    : never
;

export type ExtractTeamPropsType<ClassType> =
  ClassType extends Factory<any, any, any, any, any, any, any, infer ExtractedType, any, any>
    ? ExtractedType
    : never
;
