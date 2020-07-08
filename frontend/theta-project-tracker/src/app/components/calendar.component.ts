import { CalendarModalComponent } from './../modals/calendar-dialog-modal.component';
import { EventUtilService } from './../services/event-util.service';
import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentChecked, ViewChild, OnDestroy } from '@angular/core';
import { map, isEmpty } from 'rxjs/operators';

import {
  FullCalendarModule,
  EventApi,
  DateSelectArg,
  EventClickArg,
  CalendarApi,
  EventAddArg,
  DateInput,
  getEventClassNames,
  EventInput,
  Calendar,
  CalendarOptions,
  FullCalendarComponent,
  CalendarDataManager,
  DayCellContentArg,
  startOfDay
} from '@fullcalendar/angular';
import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { title, exit } from 'process';
import { isNull } from 'util';
import { HttpClient } from '@angular/common/http';
import { Observable, empty, Subscription } from 'rxjs';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { isEmptyExpression } from '@angular/compiler';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TitleCasePipe } from '@angular/common';



@Component({
  selector: 'app-calendar',
  template: `
  <full-calendar id="calendar" [options]="calendarOptions"></full-calendar>

  `,
  styles: [``]
})
export class CalendarComponent implements OnInit, OnDestroy {

  constructor(private eventUtilService: EventUtilService, private dialog: MatDialog) { }
  validatorTitle = new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{0,}$/)]);
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  monthIterator = 7;
  yearIterator = 2020;
  public currentEvents: EventInput[];
  subscriptions$: Subscription[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'today', center: 'title', right: 'prev next' },
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.getMethod.bind(this),
    eventClick: this.handleEventClick.bind(this),
    // eventChange: this.handleEvents.bind(this),
    defaultAllDay: true,
    firstDay: 1,
  };

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  getMethod() {
    this.eventUtilService.getEvents(this.yearIterator, this.monthIterator).pipe(map(data => {
      const array: EventInput[] = [];
      for (const i of data) {
        let day: EventInput;
        day = {
          title: i.multiplier.toString(),
          date: i.date
        }
        array.push(day);
      }
      return array;
    }))
      .subscribe(event => {
        this.currentEvents = event;
        console.log(event, "GETEVENT SEEE");
        this.calendarOptions.events = event;
      });
  }

  ngOnInit(): void {
    this.getMethod();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach(unsub => { unsub.unsubscribe(); }, );
  }

  handleEventClick(clickInfo: EventClickArg) {
    const calendarApi = clickInfo.view.calendar;
    const dialogRef = this.dialog.open(CalendarModalComponent, {
      width: '50%',
      height: '25%'
    });
    const calendarData = {
      multiplier: parseInt(clickInfo.event.title),
      date: clickInfo.event.startStr,
    };
    dialogRef.afterClosed().subscribe(res => {
      if (res === false) {
        const overT = dialogRef.componentInstance.hour.get('overTime').value;
        calendarData.multiplier = overT;
        this.eventUtilService.createEvent(calendarData).subscribe(event => {
            this.getMethod();
        });
    } else if (res) {
      if (dialogRef.componentInstance.deleteBool) {
        this.eventUtilService.deleteEvent(calendarData).subscribe(data => {
          this.getMethod();
          clickInfo.event.remove();
        });
      }
    }
  });
}
}
