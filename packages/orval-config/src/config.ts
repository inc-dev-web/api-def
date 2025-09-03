import generator from './generator.js'
import type { OutputOptions, InputOptions, HooksOptions, Config as OriginalConfig, Options as OriginalOptions } from '@orval/core'

interface Options {
  output?: string | Omit<OutputOptions, 'client' | 'httpClient'>;
  input?: string | InputOptions;
  hooks?: Partial<HooksOptions>;
}

export type Config = {
  [key: string]: Options
}

const injectGenerator = (config: Config): OriginalConfig => {
  const result = {} as OriginalConfig

  for (const key in config) {
    if(!config[key]) {
      continue
    }

    const value: OriginalOptions = config[key];

    if(typeof value.output === 'string') {
      value.output = {
        target: value.output,
        client: generator(),
        httpClient: 'fetch', 
      }
    } else {
      value.output = {
        ...value.output,
        client: generator(),
        httpClient: 'fetch',
      }
    }

    result[key] = value
  }

  return result
}

export const defineConfig = (config: Config): OriginalConfig => {
  return injectGenerator(config);
}