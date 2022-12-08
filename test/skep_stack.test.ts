import { App } from 'cdktf';
import Timezone from 'timezone-enum';
import { OrganizationProps, PersonProps, SkepStack, TeamProps } from '../src';

type TeamType = 'team' | 'guild';
type RoleType = 'engineering' | 'product';

const people: { [key: string]: PersonProps<Integrations, RoleType> } = {
  fooBar: {
    firstName: 'Foo',
    lastName: 'Bar',
    emailAddress: 'foo.bar@example.com',
    role: 'engineering',
    timeZone: Timezone['America/New_York'],
    integrations: {},
  },
  balBaz: {
    firstName: 'Bal',
    lastName: 'Baz',
    emailAddress: 'bal.baz@example.com',
    role: 'product',
    timeZone: Timezone['America/Los_Angeles'],
    integrations: {},
  },
};

const teams: { [key: string]: TeamProps<Integrations, PeopleKeys, TeamType> } = {
  fooTeam: {
    name: 'Foo',
    leads: ['fooBar'],
    members: ['balBaz'],
    integrations: {},
  },
  barGuild: {
    name: 'Bar',
    leads: ['fooBar'],
    members: ['balBaz'],
    integrations: {},
    type: 'guild',
  },
};

const organization: OrganizationProps<Integrations> = {
  name: 'Test',
  integrations: {},
};

type PeopleKeys = Extract<keyof typeof people, string>;
type TeamKeys = Extract<keyof typeof teams, string>;
interface Integrations {
}

export class TestSkepStack extends SkepStack<Integrations, PeopleKeys, TeamKeys, TeamType, RoleType> {
  get defaultConfig() {
    return {
      team: {
        type: 'team' as TeamType,
      },
    };
  }

  load(
    orgConfig: OrganizationProps<Integrations>,
    peopleConfig: Record<PeopleKeys, PersonProps<Integrations, RoleType>>,
    teamConfig: Record<TeamKeys, TeamProps<Integrations, PeopleKeys, TeamType>>,
  ): Integrations {
    orgConfig;
    peopleConfig;
    teamConfig;
    return { };
  }
}

test('SkepStack', () => {
  const app = new App();
  new TestSkepStack(app, 'test-skep-stack', organization, people, teams);
  app.synth();
});