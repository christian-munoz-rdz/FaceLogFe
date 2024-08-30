import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private isDarkTheme: boolean;

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme ? savedTheme === 'dark' : true;
    this.updateTheme();
  }

  isDarkMode() {
    return this.isDarkTheme;
  }

  changeTheme(isDark: boolean) {
    this.isDarkTheme = isDark;
    this.updateTheme();
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  updateTheme() {
    document.body.className = this.isDarkTheme ? 'dark-theme' : 'light-theme';
  }
}
