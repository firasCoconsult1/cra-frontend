import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[routerLink]',
  standalone: true
})
export class RouterLinkMockDirective {
  @Input() routerLink: any;
  @Input() queryParams: any;
  @Input() fragment: string;
}