import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MdButtonModule } from '@angular2-material/button';
import { MdIconModule } from '@angular2-material/icon';
import { MdProgressCircleModule } from '@angular2-material/progress-circle';
import { MdSliderModule } from '@angular2-material/slider';

import { AppModule } from './app.module';
import { AppDevComponent } from './dev/app-dev.component';

@NgModule({
  imports: [
    AppModule,
  ],
  declarations: [ AppDevComponent ],
  bootstrap: [ AppDevComponent ]
})
export class AppDevModule {


}
