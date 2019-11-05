import { parseErrorCode } from './parseErrorCode';

describe('parse Error code', () => {
  it('should parse error code when clean output', () => {
    expect(parseErrorCode('<RC_START>0<RC_END>')).toEqual(0);
  });

  it('should parse error code when dirty output', () => {
    expect(
      parseErrorCode('qsdqsdqsdqdsqsdqsdqsd<RC_START>2<RC_END>qsdsdqsdqsdqsd')
    ).toEqual(2);
  });
});
