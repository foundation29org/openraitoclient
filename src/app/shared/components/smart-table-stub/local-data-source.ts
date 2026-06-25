export class LocalDataSource {
  constructor(private data: any[] = []) {}

  getAll(): Promise<any[]> {
    return Promise.resolve(this.data);
  }

  load(data: any[]): void {
    this.data = data;
  }
}
