export const SAFE_PATTERN_START = '<RC_START>';
export const SAFE_PATTERN_END = '<RC_END>';

export function parseErrorCode(output: any) {
  const regex = new RegExp(
    `${SAFE_PATTERN_START}(.*)${SAFE_PATTERN_END}`,
    'sm'
  );
  const found = output.match(regex);
  if (found && found.length) {
    return Number(found[1]);
  }
  return -127;
}
