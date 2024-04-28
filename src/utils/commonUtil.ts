export function wait(timeout = 1000) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })
}
