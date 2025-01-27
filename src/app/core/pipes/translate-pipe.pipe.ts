import { Pipe, PipeTransform } from '@angular/core';
import { LocalizationService } from '../services/localization-service/localization.service';
import { LocalizationKeys } from '../services/localization-service/localization.models';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Ensures the pipe updates when language changes
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly localizationService: LocalizationService) {}

  transform(key: LocalizationKeys): string {
    return this.localizationService.translate(key);
  }
}
