export class User {
  id: number | undefined;
  name: string | undefined;
  email: string | undefined;
  location: number[] | undefined;

  constructor(values: any) {
    this.id = values.id;
  }
}
