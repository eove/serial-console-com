import { parseErrorCode } from './parseErrorCode';

describe('parse Error code', () => {
  it('should parse error code when clean output', () => {
    expect(parseErrorCode('RC_START_0_RC_END')).toEqual(0);
  });

  it('should parse error code when dirty output', () => {
    expect(
      parseErrorCode('qsdqsdqsdqdsqsdqsdqsdRC_START_2_RC_ENDqsdsdqsdqsdqsd')
    ).toEqual(2);
  });
});
