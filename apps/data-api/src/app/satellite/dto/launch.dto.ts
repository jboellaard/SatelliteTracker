import { PartialType } from '@nestjs/mapped-types';
import { ILaunch, ILocation } from 'shared/domain';

export class LaunchDto implements ILaunch {
    launchDate!: Date;
    launchSite?: ILocation | undefined;
    succeeded?: boolean | undefined;
}

export class UpdateLaunchDto extends PartialType(LaunchDto) {
    override launchDate?: Date | undefined;
}
