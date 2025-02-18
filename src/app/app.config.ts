import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { ConfigService } from './core/config/config.service';
import { APP_CONFIG } from './core/config/config.token';
import { provideMarkdown, MARKED_OPTIONS, CLIPBOARD_OPTIONS, ClipboardButtonComponent } from 'ngx-markdown';

// Function to load the configuration before app initialization
export function loadAppConfig(configService: ConfigService) {
  return () => configService.loadConfig(); 
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    {
      provide: APP_CONFIG,            
      useFactory: (configService: ConfigService) => configService.getConfig(),  
      deps: [ConfigService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: loadAppConfig,
      deps: [ConfigService],
      multi: true
    },
    provideMarkdown({
      markedOptions: {
        provide: MARKED_OPTIONS,
        useValue: {
          gfm: true,
          breaks: true,
          pedantic: false,
        },
      },
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonComponent,
        },
      }
    })
  ]
};
