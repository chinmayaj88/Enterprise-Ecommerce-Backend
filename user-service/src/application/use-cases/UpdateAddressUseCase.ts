/**
 * Update Address Use Case
 */

import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { UpdateAddressData, Address } from '../../domain/entities/Address';

export class UpdateAddressUseCase {
  constructor(
    private readonly addressRepository: IAddressRepository
  ) {}

  async execute(id: string, data: UpdateAddressData): Promise<Address> {
    return await this.addressRepository.update(id, data);
  }
}

