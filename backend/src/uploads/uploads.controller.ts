import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UploadsService } from './uploads.service.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import {
  ALLOWED_CONTENT_TYPES,
  MAX_FILES_PER_REQUEST,
  MAX_UPLOAD_BYTES,
  type UploadedImage,
} from './upload-limits.js';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Accepts a multipart batch of photos and returns their public URLs. Any
   * signed-in account may post an ad, so this needs no role beyond that.
   */
  @Post('ad-photos')
  @Auth(Role.USER)
  @ApiConsumes('multipart/form-data')
  @Throttle({ medium: { ttl: 3_600_000, limit: 120 } })
  @UseInterceptors(
    FilesInterceptor('images', MAX_FILES_PER_REQUEST, {
      // In memory, not on disk: the buffer goes straight to S3 and never needs
      // a temp file this process would then have to clean up.
      limits: {
        fileSize: MAX_UPLOAD_BYTES,
        files: MAX_FILES_PER_REQUEST,
      },
      // Rejects a bad type before its body is buffered, so an oversized MP4
      // cannot occupy memory on the way to being refused.
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_CONTENT_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              `${file.originalname}: only JPEG, PNG, WebP or AVIF images can be uploaded`,
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadAdPhotos(@UploadedFiles() files: UploadedImage[]) {
    return this.uploadsService.uploadAdPhotos(files ?? []);
  }
}
