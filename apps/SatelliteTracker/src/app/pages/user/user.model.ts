export class User {
  id: string | undefined;
  name: string | undefined;
  email: string | undefined;
  location: string | undefined;

  constructor(values: any) {
    this.id = values.id;
  }
}
