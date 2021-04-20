import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UiModule } from './modules/ui/ui.module';

export function jwtTokenGetter(): string {
  return localStorage.getItem('IT-Support-Portal') ? JSON.parse(localStorage.getItem('IT-Support-Portal')).token : null;
  // if (localStorage.getItem('ngMonitoring')) {
  //  return JSON.parse(localStorage.getItem('ngMonitoring')).token;
  // }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    JwtModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: jwtTokenGetter,
        // whitelistedDomains: ['localhost:3001', 'localhost:4200'],
        //  blacklistedRoutes: ['http://localhost:3000/api/auth'],
      },
    }),
    AppRoutingModule,
    UiModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
