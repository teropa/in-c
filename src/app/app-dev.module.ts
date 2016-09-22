import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppModule } from './app.module';
import { AppDevComponent } from './dev/app-dev.component';
import { DevControlsComponent } from './dev/dev-controls.component';

@NgModule({
  imports: [
    BrowserModule,
    AppModule,
    StoreDevtoolsModule.instrumentStore()
  ],
  declarations: [ AppDevComponent, DevControlsComponent ],
  bootstrap: [ AppDevComponent ]
})
export class AppDevModule {


}
