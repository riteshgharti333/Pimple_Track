import {
  PimpleLocation,
  PimpleType,
  PimpleColor,
  PimpleSize,
  PimpleStatus,
  PimplePain,
} from "../enums/pimple.enums";

export class CreatePimpleDto {
  date: string;
  location: PimpleLocation;
  type: PimpleType;
  color: PimpleColor;
  size: PimpleSize;
  status: PimpleStatus;
  pain: PimplePain;
  notes: string;
}
