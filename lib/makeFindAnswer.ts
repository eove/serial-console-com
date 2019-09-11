import * as _ from 'lodash';

export interface MakeFindAnswerOptions {
  endPattern: string;
  lineSeparator?: string;
}

export function makeFindAnswer(options?: MakeFindAnswerOptions): Function {
  const { endPattern, lineSeparator } = _.defaults({}, options, {
    endPattern: '#',
    lineSeparator: '\n'
  });

  return (data: string) => {
    const regex = new RegExp(`(.*)(${endPattern})`, 'sm');
    const found = data.match(regex);
    if (found && found.length) {
      // console.log('found:', found[1].split(lineSeparator));
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
