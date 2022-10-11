import { Construct } from 'constructs';
import { toKebabSlug, toSlug } from './helpers';

export interface BaseProps {
  readonly idOverride?: string; // Use this to manage resource renaming without affecting Terraform resource name changes
}

export abstract class Base<T extends BaseProps> extends Construct {
  protected _props: T;
  protected _id: string;
  protected _slug: string;
  protected _kebabSlug: string;
  protected _excludePropertiesFromJson: string[];

  constructor(
    scope: Construct,
    props: T,
    rawSlug: (props: T) => string,
    idPrefix: string = '',
    excludeBasePropertiesFromJson: boolean = true,
    excludePropertiesFromJson: string[] = [],
  ) {
    let slug: string = toSlug(rawSlug(props));
    let id = props.idOverride ? toSlug(props.idOverride) : toSlug(`${idPrefix}${idPrefix ? '-' : ''}${slug}`);
    super(scope, id);
    const baseProperties: string[] = ['kebabSlug', 'slug', 'id'];
    this._id = id;
    this._slug = slug;
    this._kebabSlug = toKebabSlug(slug);
    this._props = props;
    this._excludePropertiesFromJson = excludePropertiesFromJson.concat(excludeBasePropertiesFromJson ? baseProperties : []);
  }

  get kebabSlug(): string {
    return this._kebabSlug;
  }

  get slug(): string {
    return this._slug;
  }

  get id(): string {
    return this._id;
  }

  toJSON() {
    let proto = Object.getPrototypeOf(this);
    const jsonObj: any = Object.assign({});

    while (proto && proto != Object.prototype) {
      Object.entries(Object.getOwnPropertyDescriptors(proto))
        .filter(([_, descriptor]) => typeof descriptor.get === 'function')
        .filter(([key, _]) => !this._excludePropertiesFromJson.includes(key))
        .map(([key, descriptor]) => {
          if (descriptor && key[0] !== '_') {
            try {
              const val = (this as any)[key];
              jsonObj[key] = val;
            } catch (error) {
              console.error(`Error calling getter ${key}`, error);
            }
          }
        });
      proto = Object.getPrototypeOf(proto);
    }

    return jsonObj;
  }

  warn(message: string) {
    console.log(`WARNING: ${message}`);
  }
}
