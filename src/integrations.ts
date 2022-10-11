import { OrganizationBaseProps } from './organization';
import { PersonBaseProps } from './person';
import { TeamBaseProps } from './team';
import { ExtractOrganizationPropsType, ExtractPersonPropsType, ExtractTeamPropsType } from './type_extractors';

export type OrganizationIntegrationsProps<IntegrationsType> = {
  [Key in keyof IntegrationsType]: ExtractOrganizationPropsType<IntegrationsType[Key]>
}
export type PersonIntegrationsProps<IntegrationsType> = {
  [Key in keyof IntegrationsType]: ExtractPersonPropsType<IntegrationsType[Key]>
}
export type TeamIntegrationsProps<IntegrationsType> = {
  [Key in keyof IntegrationsType]: ExtractTeamPropsType<IntegrationsType[Key]>
}

export interface OrganizationPropsWithIntegrations<IntegrationsType> extends OrganizationBaseProps {
  readonly integrations: IntegrationsType;
}
export interface PersonPropsIntegrations<IntegrationsType, RoleType> extends PersonBaseProps<RoleType> {
  readonly integrations: IntegrationsType;
}
export interface TeamPropsIntegrations<
  IntegrationsType,
  PersonKeyType,
  TeamTypeType extends string
> extends TeamBaseProps<PersonKeyType, TeamTypeType> {
  readonly integrations: IntegrationsType;
}

export type OrganizationProps<IntegrationsType> = OrganizationPropsWithIntegrations<OrganizationIntegrationsProps<IntegrationsType>>;
export type PersonProps<IntegrationsType, RoleType> = PersonPropsIntegrations<PersonIntegrationsProps<IntegrationsType>, RoleType>;
export type TeamProps<
  IntegrationsType,
  PersonKeyType,
  TeamTypeType extends string
> = TeamPropsIntegrations<TeamIntegrationsProps<IntegrationsType>, PersonKeyType, TeamTypeType>;
