import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

const routing = RouterModule.forChild([{ path: '', component: HomeComponent }]);
@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, ClarityModule, routing],
})
export class HomeModule {}
