import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Role } from './role.enum.js';
import { ROLES_KEY } from './roles.decorator.js';
import type { AuthenticatedUser } from './current-user.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => hasRole(user, role));
  }
}

function hasRole(user: AuthenticatedUser, role: Role): boolean {
  switch (role) {
    case Role.ADMIN:
      return user.isAdmin;
    case Role.ADVERTISER:
      return user.isAdvertiser;
    case Role.CUSTOMER:
      return true;
  }
}
