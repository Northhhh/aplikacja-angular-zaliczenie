import { Component, OnInit } from '@angular/core';
import { NbpService } from './services/nbp.service';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {availableCurrencies} from "../consts/availableCurrencies";
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavigationComponent],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = "";

  isError = false;

  constructor(private service: NbpService) { }
}
