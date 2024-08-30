import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-on-off-switch',
  standalone: true,
  imports: [],
  templateUrl: './on-off-switch.component.html',
  styleUrl: './on-off-switch.component.scss'
})
export class OnOffSwitchComponent {
  @Input() checkedValue!: boolean;

  constructor() {}

}
