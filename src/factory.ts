import { TerraformProvider, TerraformVariable } from 'cdktf';
import { Construct } from 'constructs';
import { getArrayOfKeys, mapRecord } from './helpers';
import { BaseOrganization, OrganizationBaseProps } from './organization';
import { BasePerson, PersonBaseProps } from './person';
import { ProviderParameters } from './provider';
import { BaseTeam, TeamBaseProps } from './team';
import { ExtractOrganizationType, ExtractPersonType, ExtractTeamType } from './type_extractors';

export abstract class Factory<
  PersonKeyType extends string,
  TeamTypeType extends string,
  RoleType,
  OrganizationPropsType,
  OrganizationType extends BaseOrganization<OrganizationPropsType>,
  PersonPropsType,
  PersonType extends BasePerson<PersonPropsType, RoleType>,
  TeamPropsType,
  TeamType extends BaseTeam<PersonKeyType, RoleType, PersonPropsType, PersonType, TeamTypeType, TeamPropsType>,
  ProviderParametersType,
  DependenciesType extends { [key: string]: Factory<
  PersonKeyType,
  TeamTypeType,
  RoleType,
  OrganizationPropsType, OrganizationType,
  PersonPropsType, PersonType,
  TeamPropsType, TeamType,
  ProviderParametersType,
  {}
  >; },
> {
  scope: Construct;
  namespace: string;
  organization?: OrganizationType;
  people?: Record<PersonKeyType, PersonType>;
  teams?: Record<string, TeamType>;
  organizationConfig: OrganizationPropsType & OrganizationBaseProps;
  peopleConfig: Record<PersonKeyType, PersonPropsType & PersonBaseProps<RoleType>>;
  teamsConfig: Record<string, TeamPropsType & TeamBaseProps<PersonKeyType, TeamTypeType>>;

  abstract organizationConstructor: new (
    scope: Construct,
    id: string,
    config: OrganizationPropsType & OrganizationBaseProps,
    dependencies: { [key in keyof DependenciesType]: ExtractOrganizationType<DependenciesType[key]> }
  ) => OrganizationType

  abstract personConstructor: new (
    scope: Construct,
    id: string,
    organization: OrganizationType,
    config: PersonPropsType & PersonBaseProps<RoleType>,
    dependencies: { [key in keyof DependenciesType]: ExtractPersonType<DependenciesType[key]> }
  ) => PersonType

  abstract teamConstructor: new (
    scope: Construct,
    id: string,
    organization: OrganizationType,
    people: Record<PersonKeyType, PersonType>,
    config: TeamPropsType & TeamBaseProps<PersonKeyType, TeamTypeType>,
    dependencies: { [key in keyof DependenciesType]: ExtractTeamType<DependenciesType[key]> }
  ) => TeamType

  abstract providerParameters: ProviderParameters<keyof ProviderParametersType>

  abstract providerConstructor: new (
    scope: Construct,
    id: string,
    config: ProviderParametersType
  ) => TerraformProvider

  constructor(
    scope: Construct,
    namespace: string,
    organizationConfig: OrganizationPropsType & OrganizationBaseProps,
    peopleConfig: Record<PersonKeyType, PersonPropsType & PersonBaseProps<RoleType>>,
    teamsConfig: Record<string, TeamPropsType & TeamBaseProps<PersonKeyType, TeamTypeType>>,
  ) {
    this.scope = scope;
    this.namespace = namespace;
    this.organizationConfig = organizationConfig;
    this.peopleConfig = peopleConfig;
    this.teamsConfig = teamsConfig;
  }

  load(dependencies: DependenciesType | undefined = undefined) {
    const providerConfig = getArrayOfKeys(this.providerParameters).reduce((previous, key) => {
      // type X = ProviderParametersType[typeof key];
      previous[key] = new TerraformVariable(this.scope, `${this.namespace.toUpperCase()}_${key.toString().toUpperCase()}`, this.providerParameters[key]).value;
      return previous;
    }, Object.assign({}));
    new this.providerConstructor(this.scope, `${this.namespace}-provider`, providerConfig);
    const organizationDependencies = Object.entries(dependencies ?? {}).reduce((current, [name, factory]) => {
      current[name] = factory.organization;
      return current;
    }, Object.assign({}));
    this.organization = new this.organizationConstructor(this.scope, this.namespace, this.organizationConfig, organizationDependencies);
    const peopleDependencies = Object.entries(dependencies ?? {}).reduce((current, [name, factory]) => {
      current[name] = factory.people;
      return current;
    }, Object.assign({}));
    this.people = mapRecord(this.peopleConfig, personConfig => new this.personConstructor(
      this.scope,
      this.namespace,
      this.organization!, personConfig,
      peopleDependencies,
    ));
    const teamDependencies = Object.entries(dependencies ?? {}).reduce((current, [name, factory]) => {
      current[name] = factory.teams;
      return current;
    }, Object.assign({}));
    this.teams = mapRecord(this.teamsConfig, teamConfig => new this.teamConstructor(
      this.scope,
      this.namespace,
      this.organization!,
      this.people!,
      teamConfig,
      teamDependencies,
    ));
  }

  getPerson(key: PersonKeyType): PersonType {
    if (!this.people) throw 'Please call load() before this method.';
    return this.people[key];
  }

  get organizationJson() {
    if (!this.organization) throw 'Please call load() before this method.';
    return this.organization.toJSON();
  }

  get peopleJson() {
    if (!this.people) throw 'Please call load() before this method.';
    return mapRecord(this.people, (person) => person.toJSON());
  }

  get teamsJson() {
    if (!this.teams) throw 'Please call load() before this method.';
    return mapRecord(this.teams, (team) => team.toJSON());
  }
}
