export type ClipControlMessages = {
  play: string
  pause: string
}

/** Substitutes `{name}` in a next-intl string.
 *  The message owns the word order, so Japanese can read 「奈良の鹿を再生」
 *  while English reads "Play Nara deer".
 */
export function fillClipName(template: string, name: string): string {
  return template.split('{name}').join(name)
}

export function clipControlLabel(
  name: string,
  playing: boolean,
  messages: ClipControlMessages
): string {
  return fillClipName(playing ? messages.pause : messages.play, name)
}

/** Next or previous index, wrapping at both ends.
 *  `delta` is usually +1 or -1, but any integer works.
 */
export function wrapClipIndex(
  index: number,
  delta: number,
  count: number
): number {
  if (count <= 0) return 0
  // JavaScript's `%` keeps the sign of the left side, so stepping back
  // from 0 produces -1, not the last index. Add `count` and mod again.
  return (((index + delta) % count) + count) % count
}
