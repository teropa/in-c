import { NgModuleRef, ApplicationRef } from '@angular/core';
import { StoreModule, Store } from '@ngrx/store';


let appState: any;

export function hotModuleReplacement(
  bootloader: () => Promise<NgModuleRef<any>>,
  module: any
) {
  let MODULE_REF: NgModuleRef<any>;

  console.time('bootstrap');
  if (document.readyState === 'complete') {
    bootloader()
      .then((modRef: NgModuleRef<any>) => MODULE_REF = modRef)
      .then(() => console.timeEnd('bootstrap'));
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      bootloader()
        .then((modRef: NgModuleRef<any>) =>  MODULE_REF = modRef)
        .then(() => console.timeEnd('bootstrap'));
    });
  }

  function getState(store: Store<any>) {
    let state:any;
    store.take(1).subscribe(s => state = s);
    return state;
  }

  module.hot.accept();

  module.hot.dispose((data: any) => {
    console.time('dispose');
    const appRef: ApplicationRef = MODULE_REF.injector.get(ApplicationRef);
    const displayNewNodes = appRef.components.map(comp => {

      // Create new host element
      const componentNode = comp.location.nativeElement;
      const newNode = document.createElement(componentNode.tagName);

      // Temporarily hide the new host element
      const newNodeDisplay = newNode.style.display;
      newNode.style.display = 'none';

      // Attach new host element
      const parentNode = componentNode.parentNode;
      parentNode.insertBefore(newNode, componentNode);

      // Make the new host element visible
      return () => newNode.style.display = newNodeDisplay;
    });

    // Destroy previous
    MODULE_REF.destroy();

    displayNewNodes.forEach(fn => fn());
    
    const store: Store<any> = MODULE_REF.injector.get(Store);
    appState = getState(store);
    (<any>Object).assign(data, { appState  });
    console.timeEnd('dispose');
  });

}

export function provideHotStoreModule(reducer: any) {
  return StoreModule.provideStore(reducer, appState);
}