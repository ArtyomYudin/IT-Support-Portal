import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ClarityModule } from '@clr/angular';

import { ReactiveFormsModule } from '@angular/forms';

import { LoginPageComponent } from '@modules/login-page/login-page.component';

const routing = RouterModule.forChild([{ path: '', component: LoginPageComponent }]);

@NgModule({
  declarations: [LoginPageComponent],
  imports: [CommonModule, ClarityModule, ReactiveFormsModule, routing],
})
export class LoginPageModule {}
