/**
 * Get Addresses Use Case
 */

import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { Address } from '../../domain/entities/Address';

export class GetAddressesUseCase {
  constructor(
    private readonly addressRepository: IAddressRepository
  ) {}

  async execute(userId: string, type?: 'shipping' | 'billing' | 'both'): Promise<Address[]> {
    if (type) {
      return await this.addressRepository.findByUserIdAndType(userId, type);
    }
    return await this.addressRepository.findByUserId(userId);
  }
}

