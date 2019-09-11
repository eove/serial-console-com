import { makeFindAnswer } from './makeFindAnswer';

describe('find answer', () => {
  let findAnswer: Function;

  beforeEach(() => {
    findAnswer = makeFindAnswer({ endPattern: '/ #', lineSeparator: '\n' });
  });

  it('should find a single line answer', () => {
    expect(findAnswer('drwxr-xr-x 18 root root 0 Sep 11 15:48 . / #')).toEqual({
      lines: ['drwxr-xr-x 18 root root 0 Sep 11 15:48 .'],
      remaining: ''
    });
  });

  it('should find a single line answer containing line feed', () => {
    expect(
      findAnswer('drwxr-xr-x 18 root root 0 Sep 11 15:48 . \n/ #')
    ).toEqual({
      lines: ['drwxr-xr-x 18 root root 0 Sep 11 15:48 .'],
      remaining: ''
    });
  });

  it('should find a multi line answer containing line feed', () => {
    expect(
      findAnswer(
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

  it('should not find an answer when no end pattern found', () => {
    expect(
      findAnswer(
        'drwxr-xr-x 18 root root 0 Sep 11 15:48 . \ndrwxr-xr-x 18 root root 0 Sep 11 15:48 .. \n'
      )
    ).toEqual({
      lines: [],
      remaining:
        'drwxr-xr-x 18 root root 0 Sep 11 15:48 . \ndrwxr-xr-x 18 root root 0 Sep 11 15:48 .. \n'
    });
  });
});
