import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { availableCurrencies } from '../../consts/availableCurrencies';
import { CommonModule } from '@angular/common';
import { of, switchMap } from 'rxjs';
import { NbpService } from '../services/nbp.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit {
  public currency: any;
  public currencies = availableCurrencies;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private service: NbpService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( paramMap => {
      this.currency = paramMap.get('currency');
    });
  }

  syncRates()
  {
    this.service.syncRates(this.currency);
  }
}
