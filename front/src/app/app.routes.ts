import { Routes } from '@angular/router';
import { ExchangeComponent } from './exchange/exchange.component';

export const routes: Routes = [
    { path: 'exchange/:currency', component: ExchangeComponent },
    {path:'**', redirectTo: 'exchange/EUR'},
];
