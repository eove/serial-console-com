import { makeParseConsoleOutput } from './makeParseConsoleOutput';

describe('parse console output', () => {
  let parseConsoleOutput: Function;

  beforeEach(() => {
    parseConsoleOutput = makeParseConsoleOutput({
      prompt: '/ #',
      lineSeparator: '\n'
    });
  });

  it('should return a single line when output contains a line separator and prompt', () => {
    expect(
      parseConsoleOutput('drwxr-xr-x 18 root root 0 Sep 11 15:48 . \n/ #')
    ).toEqual({
      lines: ['drwxr-xr-x 18 root root 0 Sep 11 15:48 .'],
      remaining: ''
    });
  });

  it('should return many lines when output contains line separator and prompt', () => {
    expect(
      parseConsoleOutput(
        'drwxr-xr-x 18 root root 0 Sep 11 15:48 . \ndrwxr-xr-x 18 root root 0 Sep 11 15:48 .. \n/ #'
      )
    ).toEqual({
      lines: [
        'drwxr-xr-x 18 root root 0 Sep 11 15:48 .',
        'drwxr-xr-x 18 root root 0 Sep 11 15:48 ..'
      ],
      remaining: ''
    });
  });

  it('should only return remaining data when no prompt in output', () => {
    expect(
      parseConsoleOutput(
        'drwxr-xr-x 18 root root 0 Sep 11 15:48 . \ndrwxr-xr-x 18 root root 0 Sep 11 15:48 .. \n'
      )
    ).toEqual({
      lines: [],
      remaining:
        'drwxr-xr-x 18 root root 0 Sep 11 15:48 . \ndrwxr-xr-x 18 root root 0 Sep 11 15:48 .. \n'
    });
  });

  it('should only return remaining data when no line separator in output', () => {
    expect(
      parseConsoleOutput('drwxr-xr-x 18 root root 0 Sep 11 15:48 . / #')
    ).toEqual({
      lines: [],
      remaining: 'drwxr-xr-x 18 root root 0 Sep 11 15:48 . / #'
    });
  });
});
