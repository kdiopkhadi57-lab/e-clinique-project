import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav *ngIf="totalPages > 1" class="pagination-bar" aria-label="Pagination">
      <button type="button" class="btn btn-sm btn-outline-secondary" [disabled]="page === 1" (click)="pageChange.emit(page - 1)">
        <i class="bi bi-chevron-left"></i>
      </button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button type="button" class="btn btn-sm btn-outline-secondary" [disabled]="page === totalPages" (click)="pageChange.emit(page + 1)">
        <i class="bi bi-chevron-right"></i>
      </button>
    </nav>
  `,
  styles: [`
    .pagination-bar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px; }
    .pagination-bar span { min-width: 88px; text-align: center; font-size: .9rem; color: #52635c; }
  `]
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();
}
