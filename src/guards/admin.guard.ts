import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('request', request);
    if (!request.currentUser) {
      return false;
    }
    return request.currentUser.admin;
  }
}
