import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { CreateAddressData, Address } from '../../domain/entities/Address';

export class CreateAddressUseCase {
  constructor(
    private readonly addressRepository: IAddressRepository
  ) {}

  async execute(data: CreateAddressData): Promise<Address> {
    return await this.addressRepository.create(data);
  }
}

