/**
 * Delete Address Use Case
 */

import { IAddressRepository } from '../../domain/repositories/IAddressRepository';

export class DeleteAddressUseCase {
  constructor(
    private readonly addressRepository: IAddressRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.addressRepository.delete(id);
  }
}

