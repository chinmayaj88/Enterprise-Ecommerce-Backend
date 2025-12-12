/**
 * Value object representing a shipping address
 */
export class Address {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly company: string | null,
    public readonly addressLine1: string,
    public readonly addressLine2: string | null,
    public readonly city: string,
    public readonly state: string | null,
    public readonly postalCode: string,
    public readonly country: string,
    public readonly phone: string | null
  ) {
    if (!firstName || !lastName) {
      throw new Error('First name and last name are required');
    }
    if (!addressLine1 || !city || !postalCode || !country) {
      throw new Error('Address line 1, city, postal code, and country are required');
    }
  }

  getFullAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.postalCode,
      this.country,
    ].filter(Boolean);
    return parts.join(', ');
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

