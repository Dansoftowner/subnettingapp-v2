import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService } from '../../services/history.service';
import { HistoryItem } from '../../models/history-item.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('historyList') historyList!: ElementRef<HTMLDivElement>;

  items: HistoryItem[] = [];
  offset = 0;
  limit = 10;
  loading = false;
  allLoaded = false;
  errorMessage: string | null = null;

  constructor(
    private historyService: HistoryService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadMore();
  }

  ngAfterViewInit(): void {
    this.historyList.nativeElement.addEventListener(
      'scroll',
      this.onScroll.bind(this)
    );
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
    this.errorMessage = null;

    this.historyService.getHistoryItems(this.offset, this.limit).subscribe({
      next: (res) => {
        this.items.push(...res.items);
        this.offset += res.items.length;
        if (res.items.length < this.limit) this.allLoaded = true;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const fallback = this.translate.instant('dashboard.server_error');
        this.errorMessage = err.error?.message || err.message || fallback;
      },
    });
  }

  newCalculation(): void {
    this.errorMessage = null;
    this.historyService.createHistoryItem().subscribe({
      next: (item) => {
        this.router.navigate(['/form'], { state: { historyItem: item } });
      },
      error: (err) => {
        const fallback = this.translate.instant('dashboard.server_error');
        this.errorMessage = err.error?.message || err.message || fallback;
      },
    });
  }

  openItem(item: HistoryItem): void {
    this.router.navigate(['/form'], { state: { historyItem: item } });
  }
}
