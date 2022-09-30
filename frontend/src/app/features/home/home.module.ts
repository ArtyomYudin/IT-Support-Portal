import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [{ path: '', component: HomeComponent }];
@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, ClarityModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeModule {}
