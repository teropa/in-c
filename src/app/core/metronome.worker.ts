// Redeclare postMessage because TypeScript.
declare function postMessage(msg: any): void;

let intervalId: number;

onmessage = (evt: MessageEvent) => {
  if (evt.data.command === 'start') {
    intervalId = setInterval(() => postMessage('tick'), evt.data.interval);
  } else if (evt.data.command === 'stop') {
    clearInterval(intervalId);
  }
}