// Redeclare postMessage because TypeScript.
declare function postMessage(msg: any): void;

let interval: number;

onmessage = (evt: MessageEvent) => {
  if (evt.data.command === 'start') {
    postMessage('tick');
    interval = setInterval(() => postMessage('tick'), evt.data.interval);
  } else if (evt.data.command === 'stop') {
    clearInterval(interval);
  }
}