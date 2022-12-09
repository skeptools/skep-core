import { TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { extract, getArrayOfKeys, mapRecord } from './helpers';
import { OrganizationProps, PersonProps, TeamProps } from './integrations';
import { BaseOrganization, OrganizationBaseProps } from './organization';
import { BasePerson, PersonBaseProps } from './person';
import { BaseTeam, TeamBaseProps } from './team';
import { ExtractOrganizationPropsType, ExtractPersonPropsType, ExtractTeamPropsType } from './type_extractors';

export abstract class SkepStack<
  IntegrationsType,
  PersonKeyType extends string,
  TeamKeyType extends string,
  TeamTypeType extends string,
  RoleType
> extends TerraformStack {
  _integrations: IntegrationsType;
  abstract get defaultConfig(): {
    readonly organization?: Partial<OrganizationBaseProps>;
    readonly person?: Partial<PersonBaseProps<RoleType>>;
    readonly team?: Partial<TeamBaseProps<PersonKeyType, TeamTypeType>>;
  }

  constructor(
    scope: Construct,
    id: string,
    orgConfig: OrganizationProps<IntegrationsType>,
    peopleConfig: Record<PersonKeyType, PersonProps<IntegrationsType, RoleType>>,
    teamsConfig: Record<TeamKeyType, TeamProps<IntegrationsType, PersonKeyType, TeamTypeType>>,
  ) {
    super(scope, id);
    this._integrations = this.load(orgConfig, peopleConfig, teamsConfig);

    const orgBase = new BaseOrganization<{}>(this, '', orgConfig, false);
    const orgJson = {
      ...orgBase.toJSON(),
      ...getArrayOfKeys(this._integrations).reduce((previous, key) => {
        const value: any = this._integrations[key];
        if ('organizationJson' in value) previous[key] = value.organizationJson;
        return previous;
      }, Object.assign({})),
    };
    new TerraformOutput(this, 'organization', {
      value: orgJson,
    });


    const basePeople = mapRecord(peopleConfig, (personConfig) => new BasePerson<{}, RoleType>(this, '', personConfig, false));
    const peopleJson = getArrayOfKeys(peopleConfig).reduce((allPeople, personKey) => {
      const personBase = basePeople[personKey];
      const personJson = {
        ...personBase.toJSON(),
        ...getArrayOfKeys(this._integrations).reduce((previous, key) => {
          const value: any = this._integrations[key];
          if ('peopleJson' in value) previous[key] = value.peopleJson[personKey];
          return previous;
        }, Object.assign({})),
      };
      allPeople[personBase.slug] = personJson;
      return allPeople;
    }, Object.assign({}));
    new TerraformOutput(this, 'people', {
      value: peopleJson,
    });

    const teamsJson = getArrayOfKeys(teamsConfig).reduce((allTeams, teamKey) => {
      const teamBase = new BaseTeam<
      PersonKeyType,
      RoleType,
      {},
      BasePerson<{}, RoleType>, TeamTypeType, {}
      >(
        this,
        '',
        basePeople,
        teamsConfig[teamKey],
        false,
      );
      const teamJson = {
        ...teamBase.toJSON(),
        ...getArrayOfKeys(this._integrations).reduce((previous, key) => {
          const value: any = this._integrations[key];
          if ('teamsJson' in value) previous[key] = value.teamsJson[teamKey];
          return previous;
        }, Object.assign({})),
      };
      allTeams[teamBase.slug] = teamJson;
      return allTeams;
    }, Object.assign({}));
    new TerraformOutput(this, 'teams', {
      value: teamsJson,
    });
  }

  abstract load(
    orgConfig: OrganizationProps<IntegrationsType>,
    peopleConfig: Record<PersonKeyType, PersonProps<IntegrationsType, RoleType>>,
    teamConfig: Record<TeamKeyType, TeamProps<IntegrationsType, PersonKeyType, TeamTypeType>>
  ): IntegrationsType

  getOrganizationConfig<K extends keyof IntegrationsType>(
    config: OrganizationProps<IntegrationsType>,
    namespace: K,
  ): ExtractOrganizationPropsType<IntegrationsType[typeof namespace]> & OrganizationBaseProps {
    return Object.assign(
      {},
      this.defaultConfig.organization ?? {},
      extract<OrganizationBaseProps, OrganizationProps<IntegrationsType>>(config), config.integrations[namespace],
    );
  }

  getPersonConfig<K extends keyof IntegrationsType>(
    config: Record<PersonKeyType, PersonProps<IntegrationsType, RoleType>>,
    namespace: K,
  ): Record<
    PersonKeyType,
    ExtractPersonPropsType<IntegrationsType[typeof namespace]> & PersonBaseProps<RoleType>
    > {
    return mapRecord<
    ExtractPersonPropsType<IntegrationsType[typeof namespace]> & PersonBaseProps<RoleType>,
    PersonKeyType,
    PersonProps<IntegrationsType, RoleType>
    >(
      config,
      personConfig => personConfig.integrations[namespace] ? Object.assign(
        {},
        this.defaultConfig.person ?? {},
        extract<PersonBaseProps<RoleType>, PersonProps<IntegrationsType, RoleType>>(personConfig),
        personConfig.integrations[namespace],
      ) : undefined,
    );
  }

  getTeamConfig<K extends keyof IntegrationsType>(
    config: Record<TeamKeyType, TeamProps<IntegrationsType, PersonKeyType, TeamTypeType>>,
    namespace: K,
  ): Record<
    TeamKeyType,
    ExtractTeamPropsType<IntegrationsType[typeof namespace]> & TeamBaseProps<PersonKeyType, TeamTypeType>
    > {
    return mapRecord<
    ExtractTeamPropsType<IntegrationsType[typeof namespace]> & TeamBaseProps<PersonKeyType, TeamTypeType>,
    TeamKeyType,
    TeamProps<IntegrationsType, PersonKeyType, TeamTypeType>
    >(
      config,
      teamConfig => teamConfig.integrations[namespace] ? Object.assign(
        {},
        this.defaultConfig.team ?? {},
        extract<TeamBaseProps<PersonKeyType, TeamTypeType>, TeamProps<IntegrationsType, PersonKeyType, TeamTypeType>>(teamConfig),
        teamConfig.integrations[namespace],
      ) : undefined,
    );
  }
}
