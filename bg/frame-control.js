export function budget(generator, millis) {
  let result = generator.next();
  return () => {
    const frameStart = Date.now();

    while ((Date.now() - frameStart < millis) && !result.done) {
      result = generator.next();
    }

    if (result.done) {
      return result.value;
    }

    return undefined;
  }; 
}
