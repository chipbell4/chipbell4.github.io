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

export function frameBudget(generator) {
  const doWork = budget(generator, 16);

  let frameCount = 0;

  return new Promise((resolve) => {
    const workInFrame = () => {
      const result = doWork();
      if (result === undefined) {
        frameCount++;
        requestAnimationFrame(workInFrame);
      } else {
        console.log('Done in ', frameCount, 'frames');
        resolve(result);
      }
    }

    requestAnimationFrame(workInFrame);
  });
}
