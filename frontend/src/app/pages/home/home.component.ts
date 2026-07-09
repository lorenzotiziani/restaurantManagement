import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ChartConfiguration, ChartType} from "chart.js";

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isGraph:boolean = true;
  username: string = '';
  ruoloId: number = 0;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = user.nome + ' ' + user.cognome;
        this.ruoloId = user.ruoloId;
      }
    });

  }

  logout() {
    this.authService.logout().subscribe({
      complete: () => console.log('Logout completato')
    });
  }

  toggleView() { this.isGraph = !this.isGraph; }
  public barChartType: ChartType = 'bar';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public barChartData: ChartConfiguration['data'] = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug'],
    datasets: [
      {
        label: 'Vendite',
        data: [65, 59, 80, 81, 56, 55, 40]
      }
    ]
  };

}