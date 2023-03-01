import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

//typrescritp has some issue with promisify

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email);

    // 0 is false !
    if (users.length) {
      throw new BadRequestException('email already in use');
    }

    // !! --  Hash the password -- !!

    //Generate salt
    const salt = randomBytes(8).toString('hex');

    //Hash the salt and the password together

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together

    const storedPassword = salt + '.' + hash.toString('hex');

    // Create a new user and save it

    const user = await this.usersService.create(email, storedPassword);

    // !! -- !!

    // Return the user

    return user;
  }

  

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    // 0 is false !
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Wrong credentials');
    }

    return user;
  }
}
