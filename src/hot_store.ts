import { NgModuleRef } from '@angular/core';
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
        .then((modRef: NgModuleRef<any>) => MODULE_REF = modRef)
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
    const store: Store<any> = MODULE_REF.injector.get(Store);
    const appState = getState(store);
    (<any>Object).assign(data, { appState  });
    console.timeEnd('dispose');
  });

}
