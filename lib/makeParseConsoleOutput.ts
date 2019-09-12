import * as _ from 'lodash';

export interface MakeParseConsoleOutputOptions {
  prompt?: string;
  lineSeparator?: string;
}

export function makeParseConsoleOutput(
  options?: MakeParseConsoleOutputOptions
): Function {
  const { prompt, lineSeparator } = _.defaults({}, options, {
    prompt: '/ #',
    lineSeparator: '\n'
  });

  return (data: string) => {
    const regex = new RegExp(`(.*)${lineSeparator}(${prompt})`, 'sm');
    const found = data.match(regex);
    if (found && found.length) {
      return {
        lines: found[1]
          .split(lineSeparator)
          .map(l => l.trim())
          .filter(x => x),
        remaining: ''
      };
    }
    return {
      lines: [],
      remaining: data
    };
  };
}
