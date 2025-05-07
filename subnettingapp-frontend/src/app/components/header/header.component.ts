import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  user: User | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.user = this.auth.getCurrentUser();
    auth.authChanged.subscribe((u) => (this.user = u));
  }

  logout(): void {
    this.user = null;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
