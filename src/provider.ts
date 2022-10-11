export type TerraformPrimitiveType = 'string' | 'number' | 'bool'
export interface ProviderParameter {
  readonly type: TerraformPrimitiveType; // Would love to DRY this and detect it based on ProviderParametersType, but it might not be possible
  readonly default?: any;
  readonly description?: string;
}
export type ProviderParameters<ProviderParametersType extends string | number | symbol> = { [K in ProviderParametersType]: ProviderParameter}
