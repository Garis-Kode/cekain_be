import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  async findAll() {
    const users = await this.userRepository.find();
    console.log(users); // Temporary logging for debugging
    return users;
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return await this.userRepository.remove(user);
  }
}
