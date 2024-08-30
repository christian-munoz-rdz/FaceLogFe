import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/global/theme/theme.service';

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [],
  templateUrl: './theme-switch.component.html',
  styleUrl: './theme-switch.component.scss'
})
export class ThemeSwitchComponent {
  
  constructor(public themeService: ThemeService) {}

  onThemeChange(event: any) {
    this.themeService.changeTheme(event.target.checked);
  }
}
