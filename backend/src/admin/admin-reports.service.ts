import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReportStatus, type Prisma } from '../generated/prisma/client.js';
import {
  paginate,
  resolvePage,
  resolveSort,
  type SortOrder,
} from '../common/pagination.js';
import {
  REPORT_SORT_FIELDS,
  type ListReportsDto,
} from './dto/list-reports.dto.js';
import type { ResolveReportDto } from './dto/resolve-report.dto.js';

const LIST_INCLUDE = {
  reporter: { select: { id: true, name: true, email: true, phone: true } },
  ad: {
    select: {
      id: true,
      title: true,
      sector: true,
      status: true,
      price: true,
      locationArea: true,
      locationDistrict: true,
      photos: true,
      owner: { select: { id: true, name: true, isSuspended: true } },
      _count: { select: { reports: true } },
    },
  },
} satisfies Prisma.ReportInclude;

function buildWhere(query: ListReportsDto): Prisma.ReportWhereInput {
  const where: Prisma.ReportWhereInput = {};
  const ad: Prisma.AdWhereInput = {};

  if (query.search) {
    const contains = { contains: query.search, mode: 'insensitive' } as const;
    where.OR = [
      { id: query.search },
      { reason: contains },
      { reporter: { name: contains } },
      { reporter: { email: contains } },
      { ad: { title: contains } },
      { ad: { owner: { name: contains } } },
    ];
  }

  if (query.status?.length) {
    where.status = { in: query.status };
  }
  if (query.adId) {
    where.adId = query.adId;
  }
  if (query.adStatus?.length) {
    ad.status = { in: query.adStatus };
  }
  if (query.sector?.length) {
    ad.sector = { in: query.sector };
  }
  if (Object.keys(ad).length > 0) {
    where.ad = ad;
  }
  if (query.from || query.to) {
    where.createdAt = {
      gte: query.from ? new Date(query.from) : undefined,
      lte: query.to ? new Date(query.to) : undefined,
    };
  }

  return where;
}

function buildOrderBy(
  field: (typeof REPORT_SORT_FIELDS)[number],
  direction: SortOrder,
): Prisma.ReportOrderByWithRelationInput {
  switch (field) {
    case 'ad':
      return { ad: { title: direction } };
    case 'reporter':
      return { reporter: { name: direction } };
    default:
      return { [field]: direction };
  }
}

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListReportsDto) {
    const page = resolvePage(query);
    const sort = resolveSort(
      REPORT_SORT_FIELDS,
      'createdAt',
      query.sort,
      query.order,
    );
    const where = buildWhere(query);

    const [data, total, countByStatus] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: buildOrderBy(sort.field, sort.direction),
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.report.count({ where }),
      this.prisma.report.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return {
      ...paginate(data, total, page, sort),
      countByStatus: Object.fromEntries(
        countByStatus.map((group) => [group.status, group._count._all]),
      ),
    };
  }

  async resolve(id: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    if (report.status !== ReportStatus.PENDING) {
      throw new ConflictException('This report has already been triaged');
    }

    return this.prisma.report.update({
      where: { id },
      data: { status: dto.status },
      include: LIST_INCLUDE,
    });
  }
}
