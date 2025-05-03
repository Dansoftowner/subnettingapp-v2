import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPv4Validators } from '../form/ipv4-validators';

export interface Entry {
  subnetAddress: string;
  firstHostAddress: string;
  lastHostAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  subnetMaskBitCount: number;
  hosts: number;
  hostsUsed: number;
}

export enum TaskType {
  NetworkInfo = 'si',
  SubnetPartitioning = 'sp',
  RegularPartitioning = 'rp',
}

export interface ResultInfo {
  networkAddress: string;
  networkMask: string;
  type: TaskType;
  hostsCounts: number[];
  entries: Entry[];
}

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  resultInfo: ResultInfo;
  entries: Entry[] = [];

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
