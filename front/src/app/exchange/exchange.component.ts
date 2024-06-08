import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NbpService } from '../services/nbp.service';
import { NavigationComponent } from '../navigation/navigation.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [NavigationComponent, CommonModule],
  templateUrl: './exchange.component.html',
  styleUrl: './exchange.component.css'
})
export class ExchangeComponent implements OnInit {
  public currency: any;
  rates: any;
  daily: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private service: NbpService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      this.currency = paramMap.get('currency');

      this.loadRates(this.currency);
    });
  }

  loadRates(currency: string) {
    this.service.getRates(currency).subscribe(data => {
      if (data[0].length > 0) {
        this.rates = {
          daily: data[0] ?? [],
          monthly: data[1] ?? [],
          quaterly: data[2] ?? [],
          yearly: data[3] ?? []
        };
      }
      else this.rates = null
    });
  }

  async syncRates() {
    await this.service.syncRates(this.currency, this.router.url)
  }
}
