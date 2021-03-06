import { Component, } from '@angular/core';
import { ReportsService, Result, ReportRoute } from '../services/reports.service';
import { ProjectService } from '../services/project.service';
import { FormControl } from '@angular/forms';
import { map, switchMap, startWith } from 'rxjs/operators';
import { ReplaySubject, combineLatest, } from 'rxjs';
import { Project } from '../models/project.model';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { ExportsService } from '../services/export.service';
import * as moment from 'moment';

@Component({
  selector: 'app-reports',
  template: `
  <div class="reports">
  <button mat-raised-button (click)="onTabChange(reportRoutes.BY_PROJECT_HOURS)" color="primary">{{'report-by-project-hours' | translate}}</button>
  <button mat-raised-button (click)="onTabChange(reportRoutes.BY_PROJECT_COST)" color="primary">{{'report-by-project-money' | translate}}</button>
  <button mat-raised-button (click)="onTabChange(reportRoutes.BY_USER_HOURS)" color="primary">{{'report-by-contractor-hours' | translate}}</button>
  <button mat-raised-button (click)="onTabChange(reportRoutes.BY_USER_COST)" color="primary">{{'report-by-contractor-money' | translate}}</button>
  <button mat-raised-button (click)="onTabChange(reportRoutes.BY_BUDGET)" color="primary">{{'project-budget-report' | translate}}</button>
</div>
<div class="date-filter">
<mat-form-field class="date-from-button" appearance="fill">
    <mat-label >{{'from' | translate}}</mat-label>
    <input matInput [matDatepicker]="picker" (dateChange)="onStartDateChange($event)" [value]="startDate" [disabled]="reportRoutes.BY_BUDGET===whichTabIsShown">
    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
    <mat-datepicker #picker startView="month" ></mat-datepicker>
</mat-form-field>

<mat-form-field appearance="fill">
    <mat-label>{{'to' | translate}}</mat-label>
    <input matInput [matDatepicker]="picker2" (dateChange)="onEndDateChange($event)" [value]="endDate" [disabled]="reportRoutes.BY_BUDGET===whichTabIsShown">
    <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
    <mat-datepicker #picker2 startView="month" ></mat-datepicker>
</mat-form-field>
</div>
<div class="row-filter">
<mat-form-field *ngIf="[reportRoutes.BY_PROJECT_COST,reportRoutes.BY_PROJECT_HOURS, reportRoutes.BY_BUDGET].includes(whichTabIsShown)" >
  <mat-label>{{ 'project-select' | translate }}</mat-label>
  <mat-select [formControl]="projects" multiple>
    <mat-option *ngFor="let project of projectList$ | async" [value]="project">{{project.name}}</mat-option>
  </mat-select>
</mat-form-field>

<mat-form-field *ngIf="[reportRoutes.BY_USER_COST, reportRoutes.BY_USER_HOURS].includes(whichTabIsShown)">
  <mat-label>{{ 'users' | translate}}</mat-label>
  <mat-select [formControl]="users" multiple>
    <mat-option *ngFor="let user of userList$ | async" [value]="user">{{user.firstName}} {{user.lastName}}</mat-option>
  </mat-select>
</mat-form-field>
</div>
<div class="wrapper">
<button mat-raised-button  (click)="onExport()" color="accent">{{'export-to-excel' | translate}}</button>
</div>

<app-reports-table [items]="items$ | async" ></app-reports-table>
  `,
  styles: [`
  .reports {
    display: flex;
    justify-content: center;
  }
  button {
    margin: 15px;
  }
  .export-button {
    display: flex;
    justify-content:flex-end;
  }
  .date-filter {
    max-width: 80%;
    margin: auto;
  }
  .row-filter{
    max-width: 80%;
    margin: auto;
  }
  .wrapper {
    margin: auto;
    display: flex;
    justify-content:flex-end;
    max-width: 80%;
  }
  .date-from-button{
    margin-right:1rem;
  }
  `],
})

export class ReportsComponent {
  public reportRoutes = ReportRoute;
  whichTabIsShown: ReportRoute = ReportRoute.BY_PROJECT_HOURS;
  startDate = moment().startOf('month').format('YYYY-MM-DD');
  endDate = moment().endOf('month').format('YYYY-MM-DD');
  projects = new FormControl([]);
  users = new FormControl([]);
  private itemsSubject = new ReplaySubject<Result>();

  items$ = combineLatest(
    this.projects.valueChanges.pipe(startWith([])),
    this.users.valueChanges.pipe(startWith([]))
  )
  .pipe(
    switchMap(([projectFilter, userFilter]: [Project[], User[]]) => {
      return this.itemsSubject.asObservable().pipe(
        map(this.filterByProjects(projectFilter)),
        map(this.filterByUsers(userFilter))
      );
    })
  );

  projectList$ = this.projectService.fetchProjects();
  userList$ = this.userService.fetchUsers();

  constructor(private reportsService: ReportsService,
              private projectService: ProjectService,
              private userService: UserService,
              private exportsService: ExportsService) {
    this.onTabChange(ReportRoute.BY_PROJECT_HOURS);
  }

  public filterByProjects(projectFilter: Project[]): (dataSet: Result) => Partial<Result> {
    return (dataSet: Result) => {
      if (!projectFilter.length) {
        return dataSet;
      }
      const filtered = {};
      projectFilter.forEach((project: Project) => {
        const data = dataSet[project.name];
        if (data) {
          filtered[project.name] = data;
        }
      });
      return filtered;
    };
  }

  public filterByUsers(userFilter: User[]): (dataset: Result) => Partial<Result> {
    return (dataSet: Result) => {
      if (userFilter.length === 0) {
        return dataSet;
      }
      const filtered = {};
      userFilter.forEach((user: User) => {
        const userName = `${user.firstName} ${user.lastName}`;
        const data = dataSet[userName];
        if (data) {
          filtered[userName] = data;
        }
      });
      return filtered;
    };
  }

  public onStartDateChange(event) {
    this.startDate = moment(event.value).format('YYYY-MM-DD');
    this.onTabChange(this.whichTabIsShown);
  }

  public onEndDateChange(event) {
    this.endDate = moment(event.value).format('YYYY-MM-DD');
    this.onTabChange(this.whichTabIsShown);
  }

  public onExport() {
    switch (this.whichTabIsShown) {
      case ReportRoute.BY_PROJECT_COST:
      case ReportRoute.BY_PROJECT_HOURS:
      case ReportRoute.BY_BUDGET:
        this.exportsService.exportReport(this.startDate, this.endDate, this.projects.value, this.whichTabIsShown, false);
        break;
      case ReportRoute.BY_USER_COST:
      case ReportRoute.BY_USER_HOURS:
        this.exportsService.exportReport(this.startDate, this.endDate, this.users.value, this.whichTabIsShown, false);
        break;
    }
  }


  public onTabChange(type) {
    switch (type) {
      case ReportRoute.BY_PROJECT_COST:
      case ReportRoute.BY_PROJECT_HOURS:
      case ReportRoute.BY_BUDGET:
        this.users.setValue([]);
        this.reportsService.getReports(this.startDate, this.endDate, this.projects.value, type, false).subscribe((result: any) => {
          this.itemsSubject.next(result);
        });
        this.whichTabIsShown = type;
        break;
      case ReportRoute.BY_USER_COST:
      case ReportRoute.BY_USER_HOURS:
        this.projects.setValue([]);
        this.reportsService.getReports(this.startDate, this.endDate, this.users.value, type, true).subscribe((result: any) => {
          this.itemsSubject.next(result);
        });
        this.whichTabIsShown = type;
        break;
    }
  }
}
