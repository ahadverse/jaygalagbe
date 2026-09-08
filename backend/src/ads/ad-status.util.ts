import { BadRequestException } from '@nestjs/common';
import { AdStatus } from '../generated/prisma/client.js';

const ALLOWED_TRANSITIONS: Record<AdStatus, AdStatus[]> = {
  [AdStatus.PENDING]: [AdStatus.LIVE, AdStatus.REJECTED, AdStatus.REMOVED],
  [AdStatus.LIVE]: [AdStatus.SOLD, AdStatus.REMOVED],
  [AdStatus.REJECTED]: [AdStatus.PENDING, AdStatus.REMOVED],
  [AdStatus.SOLD]: [AdStatus.REMOVED],
  [AdStatus.REMOVED]: [],
};

export function assertTransition(from: AdStatus, to: AdStatus) {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new BadRequestException(`Cannot move ad from ${from} to ${to}`);
  }
}
