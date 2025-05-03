import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface Entry {
  subnetAddress: string;
  firstHostAddress: string;
  lastHostAddress: string;
  broadcastAddress: string;
  subnetMask: string;
}

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  entries: Entry[] = [];

  constructor(private router: Router) {
    this.entries =
      (this.router.getCurrentNavigation()?.extras?.state as any)?.entries || [];

    if (this.entries.length == 0) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {}
}
