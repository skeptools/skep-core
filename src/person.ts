import { Construct } from 'constructs';
import Timezone from 'timezone-enum';
import { Base, BaseProps } from './common';

export interface PersonBaseProps<RoleType> extends BaseProps {
  readonly firstName: string;
  readonly lastName: string;
  readonly emailAddress: string;
  readonly jobTitle?: string;
  // Not perfect because it is not typesafe, but setting this as the "slug" string for the manager.
  // Can't have AllPeople in context here because they may not exist at the right time. Can iterate on this.
  readonly manager?: string;
  readonly role: RoleType;
  readonly timeZone: Timezone;
}

export class BasePerson<PersonPropsType, RoleType> extends Base<PersonPropsType & PersonBaseProps<RoleType>> {
  constructor(
    scope: Construct,
    namespace: string,
    config: PersonPropsType & PersonBaseProps<RoleType>,
    excludeBasePropertiesFromJson: boolean = true,
  ) {
    super(
      scope,
      config,
      (baseConfig: PersonPropsType & PersonBaseProps<RoleType>) => {
        return `${baseConfig.firstName}-${baseConfig.lastName}`;
      },
      namespace,
      excludeBasePropertiesFromJson,
      excludeBasePropertiesFromJson ? ['firstName', 'lastName', 'emailAddress', 'jobTitle', 'manager', 'role'] : [],
    );
  }

  get firstName() {
    return this._props.firstName;
  }

  get lastName() {
    return this._props.lastName;
  }

  get emailAddress() {
    return this._props.emailAddress;
  }

  get jobTitle() {
    return this._props.jobTitle;
  }

  get manager() {
    return this._props.manager;
  }

  get role() {
    return this._props.role;
  }
}
