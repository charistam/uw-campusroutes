import React, { ChangeEvent, Component, MouseEvent} from 'react';
import {
    EventStart, Hour, HOURS, hoursAfter, parseHour, Schedule
  } from './schedule';


type ScheduleProps = {
  user: string;               // name of the current user
  buildings: Array<string>;   // list of known buildings
  schedule?: Schedule;        // schedule
  doAddClick: (event: EventStart) => void;     // callback to add event
  doRemoveClick: (schedule: Array<EventStart>) => void;  // callback to remove event
};

type ScheduleState = {
  hour: Hour;         // information for next event
  location: string;
  name: string;
};


/** Component for displaying and editing the user's schedule. */
export class ScheduleEditor extends Component<ScheduleProps, ScheduleState> {
  constructor(props: ScheduleProps) {
    super(props);

    const hour = (this.props.schedule !== undefined && this.props.schedule.length > 0) ?
      hoursAfter(this.props.schedule[this.props.schedule.length - 1].hour)[0] :
      "8:30";
    this.state = {hour: hour, location: this.props.buildings[0], name: ""};
  }

  render = (): JSX.Element => {
    if (!this.props.schedule) {
      return <p>Loading schedule...</p>;
    } else {
      return this.renderSchedule();
    }
  };

  renderSchedule = (): JSX.Element => {
    if (this.props.schedule === undefined)
      throw new Error('impossible');
    // console.log(this.props.schedule)
    return <div className="content">
        <p>List each building and the time you move there:</p>
        {this.renderEvents()}
        {this.renderNextEvent()}
      </div>
  };

  renderEvents = (): JSX.Element => {
    if (this.props.schedule === undefined)
      throw new Error('impossible');
    if (this.props.schedule.length === 0)
      return <div></div>;

    const events: Array<JSX.Element> = [];
    for (const event of this.props.schedule) {
      const desc = event.desc ? event.desc : "unknown class";
      if (event === this.props.schedule[this.props.schedule.length-1]) {
        events.push(<li key={event.hour}>
            <b>{event.hour}</b>: {desc} in {event.location}{' '}
            (<a href="#" onClick={this.doRemoveClick}>remove</a>)
          </li>);
      } else {
        events.push(<li key={event.hour}><b>{event.hour}</b>: {desc} in {event.location}</li>);
      }
    }

    return <ul>{events}</ul>;
  };

  renderNextEvent = (): JSX.Element => {
    if (this.props.schedule === undefined)
      throw new Error('impossible');

    const locations: Array<JSX.Element> = [];
    for (const loc of this.props.buildings) {
      locations.push(<option key={loc} value={loc}>{loc}</option>);
    }

    const first = (this.props.schedule.length === 0);
    const allowedHours = first ? HOURS :
        hoursAfter(this.props.schedule[this.props.schedule.length-1].hour);

    const hours: Array<JSX.Element> = [];
    for (const hour of allowedHours) {
      hours.push(<option key={hour} value={hour}>{hour}</option>);
    }
    if (hours.length === 0)
      return <p>Schedule is complete</p>;

    return <p>{first ? 'First' : 'Next'} class at{' '}
        <select value={this.state.hour}
            onChange={this.doHourChange}>{hours}</select>{' '}
        in{' '}
        <select value={this.state.location}
            onChange={this.doLocationChange}>{locations}</select>{' '}
        named{' '}
        <input type="text" value={this.state.name} style={{width: '65px'}}
            onChange={this.doNameChange}></input>{' '}
        <button onClick={this.doAddClick}>Add</button>
      </p>;
  }

  doRemoveClick = (_evt: MouseEvent<HTMLAnchorElement>): void => {
    if (this.props.schedule !== undefined) {
      const n = this.props.schedule.length;
      this.props.doRemoveClick(this.props.schedule.slice(0, n-1));
    }
  };

  doHourChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({hour: parseHour(evt.target.value)});
  }

  doLocationChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    this.setState({location: evt.target.value});
  }

  doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({name: evt.target.value});
  }

  doAddClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    if (this.props.schedule === undefined)
      throw new Error('impossible');

    const event: EventStart = {
      hour: this.state.hour,
      location: this.state.location,
      desc: this.state.name
    };
    this.props.doAddClick(event);

    this.setState({
        hour: hoursAfter(this.state.hour)[0],
        location: this.props.buildings[0],
        name: ""
      });
  }
}