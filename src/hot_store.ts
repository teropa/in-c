import { NgModuleRef, ApplicationRef } from '@angular/core';
import { StoreModule, Store } from '@ngrx/store';


export function hotModuleReplacement(
  bootloader: (initialState: any) => Promise<NgModuleRef<any>>,
  module: any
) {
  let MODULE_REF: NgModuleRef<any>;
  let DATA = !!module.hot.data ?
    module.hot.data.state :
    undefined;

  console.log('APP STATE', DATA);

  console.time('bootstrap');
  if (document.readyState === 'complete') {
    bootloader(DATA)
      .then((modRef: NgModuleRef<any>) => MODULE_REF = modRef)
      .then(() => console.timeEnd('bootstrap'));
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      bootloader(DATA)
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
    appRef.components.map(comp => {

      // Create new host element
      const componentNode = comp.location.nativeElement;
      const newNode = document.createElement(componentNode.tagName);

      // Temporarily hide the new host element
      const newNodeDisplay = newNode.style.display;
      newNode.style.display = 'none';

      // Attach new host element
      const parentNode = componentNode.parentNode;
      parentNode.insertBefore(newNode, componentNode);

      // Destroy previous
      comp.destroy();

      // Make the new host element visible
      newNode.style.display = newNodeDisplay;
    });
    const store: Store<any> = MODULE_REF.injector.get(Store);
    const appState = getState(store);
    (<any>Object).assign(data, { appState  });
    console.timeEnd('dispose');
  });

}
