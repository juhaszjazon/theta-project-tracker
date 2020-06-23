import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidenav-container',
  template: `
  <app-header (sidenavTriggerd)='sidenav.toggle()'></app-header>

  <mat-sidenav-container class="sidenav-container">
    <mat-sidenav #sidenav class="sidenav" mode="push" (mouseleave)="sidenav.close()" (mouseenter)="sidenav.toggle()">
      <mat-nav-list>
        <span>
          <button mat-stroked-button routerLink='/users' routerLinkActive='router-link-active' appHighLight>User</button>
          <span>
            <button mat-stroked-button routerLink='/reports' routerLinkActive='router-link-active' appHighLight>Reports</button>
        </span>
        <span>
          <button mat-stroked-button routerLink='/calendar' routerLinkActive='router-link-active' appHighLight>Calendar</button>
        </span>
        <span>
          <button mat-stroked-button routerLink='/projects' routerLinkActive='router-link-active' appHighLight>Projects</button>
        </span>
        <span>
          <button mat-stroked-button routerLink='/milestones' routerLinkActive='router-link-active' appHighLight>Milestones</button>
        </span>
        <span>
          <button mat-stroked-button routerLink='/clients' routerLinkActive='router-link-active' appHighLight>Clients</button>
        </span>
      </span>
    </mat-nav-list>
  </mat-sidenav>
  <router-outlet></router-outlet>
</mat-sidenav-container>

`,
  styles: [`
  .sidenav  {
  position: absolute;
  display: flex;
  width: 200px;
  background: #222;
  opacity: 0.6;
 }
 .mat-nav-list{
  display: flex;
  justify-content: flex-start;
  border: 200px;
}
button {
display: flex;
font-size: 12;
border: none;
color:#f0ead6;
opacity: 0.9;
outline: 0;
}
  `]
})
export class SidenavContainerComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {
  }

}