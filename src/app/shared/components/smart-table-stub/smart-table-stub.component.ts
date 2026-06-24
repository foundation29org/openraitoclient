import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LocalDataSource } from './local-data-source';

@Component({
  selector: 'ng2-smart-table',
  templateUrl: './smart-table-stub.component.html',
  standalone: false
})
export class SmartTableStubComponent implements OnChanges {
  @Input() settings: any = {};
  @Input() source: LocalDataSource | any[] | null = null;
  @Output() userRowSelect = new EventEmitter<any>();

  rows: any[] = [];
  columnKeys: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings'] || changes['source']) {
      this.columnKeys = Object.keys(this.settings?.columns || {});
      this.loadRows();
    }
  }

  private loadRows(): void {
    if (!this.source) {
      this.rows = [];
      return;
    }
    if (this.source instanceof LocalDataSource) {
      this.source.getAll().then((rows) => (this.rows = rows));
      return;
    }
    if (Array.isArray(this.source)) {
      this.rows = this.source;
    }
  }

  cellValue(row: any, key: string): string {
    const column = this.settings?.columns?.[key];
    const value = row?.[key];
    if (column?.valuePrepareFunction) {
      return column.valuePrepareFunction(value, row);
    }
    if (value && typeof value === 'object' && value.name) {
      return value.name;
    }
    return value != null ? String(value) : '';
  }

  onRowClick(row: any): void {
    this.userRowSelect.emit({ data: row, isSelected: true, selected: [row] });
  }
}
