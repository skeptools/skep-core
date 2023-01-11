import { Construct } from 'constructs';
import { Base, BaseProps } from './common';
import { getRecordValues, mapRecord, toTitleCase } from './helpers';
import { BasePerson } from './person';

export interface TeamBaseProps<PersonKeyType, TeamTypeType extends string> extends BaseProps {
  readonly name: string;
  readonly leads: PersonKeyType[];
  readonly members?: PersonKeyType[];
  readonly homepage?: string;
  readonly type?: TeamTypeType;
}

export class BaseTeam<
  PersonKeyType extends string,
  RoleType,
  PersonPropsType,
  PersonType extends BasePerson<PersonPropsType, RoleType>,
  TeamTypeType extends string, TeamPropsType
> extends Base<TeamPropsType & TeamBaseProps<PersonKeyType, TeamTypeType>> {
  _allPeople: Record<PersonKeyType, PersonType>;
  _leads: Record<PersonKeyType, PersonType>;
  _members: Record<PersonKeyType, PersonType>;

  constructor(
    scope: Construct,
    namespace: string,
    people: Record<PersonKeyType, PersonType>,
    config: TeamPropsType & TeamBaseProps<PersonKeyType, TeamTypeType>,
    excludeBasePropertiesFromJson: boolean = true,
  ) {

    super(
      scope,
      config,
      (baseConfig: TeamPropsType & TeamBaseProps<PersonKeyType, TeamTypeType>) => {
        return baseConfig.name;
      },
      namespace,
      excludeBasePropertiesFromJson,
      excludeBasePropertiesFromJson ? ['allPeople', 'homepage', 'name', 'leads', 'members', 'type'] : [],
    );
    const { members = [] } = this._props;

    this._allPeople = mapRecord(people, (person, key) => {
      if (this._props.leads.includes(key) || members.includes(key)) {
        return person;
      } else {
        return undefined;
      }
    });
    this._leads = mapRecord(people, (person, key) => {
      if (this._props.leads.includes(key)) {
        return person;
      } else {
        return undefined;
      }
    });
    this._members = mapRecord(people, (person, key) => {
      if (members.includes(key)) {
        return person;
      } else {
        return undefined;
      }
    });
  }

  get allPeople() {
    return getRecordValues(this._allPeople).map(person => person.slug);
  }

  get homepage() {
    return this._props.homepage;
  }

  get name() {
    return `${this._props.name} ${toTitleCase(this.type)}`;
  }

  get leads() {
    return getRecordValues(this._leads).map(person => person.slug);
  }

  get members() {
    return getRecordValues(this._members).map(person => person.slug);
  }

  get type() {
    return this._props.type ?? '' as TeamTypeType;
  }
}
