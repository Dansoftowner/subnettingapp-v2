import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPv4Validators } from '../form/ipv4-validators';
import { SubnetEntry } from '../../models/subnet-entry.model';
import { ResultInfo } from '../../models/result-info.model';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  resultInfo: ResultInfo;
  entries: SubnetEntry[] = [];

  constructor(private router: Router) {
    this.resultInfo =
      (this.router.getCurrentNavigation()?.extras?.state as any)?.resultInfo ||
      null;

    if (!this.resultInfo) {
      this.router.navigate(['/']);
    }

    this.entries = this.resultInfo.entries;
  }

  pow(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }

  ngOnInit(): void {}
}
