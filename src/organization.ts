import { Construct } from 'constructs';
import { Base, BaseProps } from './common';
import { mapRecord } from './helpers';
import { BasePerson } from './person';

export interface OrganizationBaseProps extends BaseProps {
  readonly managedBy?: string; // Optional marker to put on resources to indicate automation
  readonly name: string;
  readonly subGroups?: Record<string, <P, RoleType, T extends BasePerson<P, RoleType>>(person: T, key: string) => T | undefined>;
}

export class BaseOrganization<OrganizationPropsType> extends Base<OrganizationPropsType & OrganizationBaseProps> {
  constructor(
    scope: Construct,
    namespace: string,
    config: OrganizationPropsType & OrganizationBaseProps,
    excludeBasePropertiesFromJson: boolean = true,
  ) {
    super(
      scope,
      config,
      (props: OrganizationPropsType & OrganizationBaseProps) => {
        return props.name;
      },
      namespace,
      excludeBasePropertiesFromJson,
      excludeBasePropertiesFromJson ? ['name'] : [],
    );
  }

  generateSubGroups<
    PersonKeyType extends string,
    PersonPropsType,
    RoleType,
    PersonType extends BasePerson<PersonPropsType, RoleType>
  >(people: Record<PersonKeyType, PersonType>): Record<string, Record<PersonKeyType, PersonType>> {
    return mapRecord(this._props.subGroups ?? {}, (filter, _) => {
      return mapRecord(people, filter);
    });
  }

  get managedBy(): string {
    return this._props.managedBy ?? 'Managed by Skep';
  }

  get name() {
    return this._props.name;
  }
}
