import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPv4Validators } from '../form/ipv4-validators';
import { SubnetEntry } from '../../models/subnet-entry.model';
import { ResultInfo } from '../../models/result-info.model';
import { TaskType } from 'src/app/models/task-type.model';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  resultInfo: ResultInfo;
  entries: SubnetEntry[] = [];

  showExplanation = false;
  maskBitCount!: number;
  networkBinary: string[][] = [];
  firstHostBinary: string[][] = [];
  lastHostBinary: string[][] = [];
  broadcastBinary: string[][] = [];

  constructor(private router: Router) {
    this.resultInfo =
      (this.router.getCurrentNavigation()?.extras?.state as any)?.resultInfo ||
      null;

    if (!this.resultInfo) {
      this.router.navigate(['/']);
    }

    this.entries = this.resultInfo.entries;

    if (this.resultInfo.type === TaskType.NetworkInfo) {
      const entry = this.entries[0];
      this.maskBitCount = entry.subnetMaskBitCount;
      this.networkBinary = this.ipToBinaryOctets(
        this.resultInfo.networkAddress
      );
      this.firstHostBinary = this.ipToBinaryOctets(entry.firstHostAddress);
      this.lastHostBinary = this.ipToBinaryOctets(entry.lastHostAddress);
      this.broadcastBinary = this.ipToBinaryOctets(entry.broadcastAddress);
    }
  }

  ngOnInit(): void {}

  toggleExplanation(): void {
    this.showExplanation = !this.showExplanation;
  }

  private ipToBinaryOctets(ip: string): string[][] {
    return ip
      .split('.')
      .map((oct) => parseInt(oct, 10).toString(2).padStart(8, '0').split(''));
  }

  pow(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }
}
