export class PendingValues<T> {
  private values: T[] = [];

  add(value: T) {
    this.values.push(value);
  }

  claim(): T[] {
    const pending = this.values;
    this.values = [];
    return pending;
  }
}
