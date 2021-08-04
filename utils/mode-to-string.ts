export default function (mode: any) {
  if (mode === undefined || mode === null) {
    return undefined
  }

  if (typeof mode === 'string' || mode instanceof String) {
    return mode
  }

  return mode.toString(8).padStart(4, '0')
}
