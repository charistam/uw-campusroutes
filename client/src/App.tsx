import React, { ChangeEvent, MouseEvent, Component } from 'react';
import { Building, parseBuildings } from './buildings';
import { USERS } from './users';
import './App.css';
import { ScheduleEditor } from './ScheduleEditor';
import { FriendsEditor } from './FriendsEditor';
import { MapViewer } from './MapViewer';
import { isRecord } from './record';
import { EventStart, jsonifySchedule, parseSchedule, Schedule } from './schedule';
import { Friends, parseFriends, jsonifyFriends } from './friends';


type AppProps = {};  // no props

type AppState = {
  buildings?: Array<Building>;   // list of all buildings
  user?: string;                 // name of this user
  schedule?: Schedule;
  friends: Friends;              // friends list of current user
  saved?: boolean;
  show: "log-in" | "edit";       // page currently being displayed
};


/** Top-level component that performs login and navigation. */
export class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      show: "log-in",
      friends: []
    };
  }

  componentDidMount = (): void => {
    fetch('/api/buildings')
      .then(this.doBuildingsResp)
      .catch(this.doBuildingsError);;
  }

  render = (): JSX.Element => {
    if (!this.state.buildings || (this.state.user && (!this.state.schedule))) {
      return <p>Loading...</p>;
    } else if (this.state.user === undefined) {
      return this.renderLogin();
    } else if (this.state.show === "edit") {
      const buildings: Array<string> = [];
      for (const building of this.state.buildings) {
        buildings.push(building.shortName);
      }
      return <div className="content main">
        <div>
          <h1>{this.state.user}</h1>
          <br></br>
          <button onClick={this.doBackClick}>Go Back to Login</button>{' '}
          <button onClick={this.doSaveClick}>Save</button>{this.renderSaved()}
          <ScheduleEditor user={this.state.user} buildings={buildings} schedule={this.state.schedule}
            doAddClick={this.doEventAddClick} doRemoveClick={this.doEventRemoveClick}/>
          {/* TODO: Insert FriendEditor component here */}
          <FriendsEditor user={this.state.user} friends={this.state.friends} allUsers={USERS} updateFriends={this.doSaveFriendsClick}/>
        </div>
        <MapViewer user={this.state.user} buildings={this.state.buildings} schedule={this.state.schedule}/>
      </div>;
    } else {
      return this.renderLogin();
    }
  };

  renderLogin = (): JSX.Element => {
    const users: Array<JSX.Element> = [];
    users.push(<option value="" key="NA">Choose</option>)
    for (const user of USERS) {
      users.push(<option value={user} key={user}>{user}</option>)
    }

    return <div className="content">
        <label htmlFor="user">Who are you?</label>{' '}
        <select id="user" onChange={this.doGetDataChange}>{users}</select>
      </div>;
  }

  renderSaved = (): JSX.Element => {
    if (this.state.saved === true) {
      return <span> Saved successfully!</span>
    } else {
      return <span></span>
    }
  };

  doBuildingsResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
         .then((msg: string) => this.doBuildingsError(`bad status code ${res.status}: ${msg}`))
         .catch(() => this.doBuildingsError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doBuildingsJson)
        .catch(() => this.doBuildingsError("Failed to parse response data as JSON"))
    }
  }

  doBuildingsJson = (data: unknown): void => {
    if (!isRecord(data) || data.buildings === undefined) {
      this.doBuildingsError("response is not in expected form");
      return;
    }

    const buildings = parseBuildings(data.buildings);
    this.setState({buildings});
  }

  doBuildingsError = (msg: string): void => {
    console.error("error while fetching '/api/buildings', ", msg);
  }

  // TODO: Edit or add the fetch request for data to get friends information
  doGetDataChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    fetch('/api/getData?user=' + encodeURIComponent(evt.target.value))
      .then(this.doGetDataResp)
      .catch(this.doGetDataError);
    if (evt.target.value)
      this.setState({user: evt.target.value, show: "edit"});
  }

  doGetDataResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
         .then((msg: string) => this.doGetDataError(`bad status code ${res.status}: ${msg}`))
         .catch(() => this.doGetDataError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doGetDataJson)
        .catch(() => this.doGetDataError("Failed to parse response data as JSON"))
    }
  }

  doGetDataJson = (data: unknown): void => {
    if (!isRecord(data) || data.schedule === undefined || data.friends === undefined) {
      this.doGetDataError("response is not in expected form");
      return;
    }

    const schedule = parseSchedule(data.schedule); // parses schedule field of res
    const friends = parseFriends(data.friends); // parses friends field of res
    this.setState({show: "edit", schedule: schedule, friends: friends});
  }

  doGetDataError = (msg: string): void => {
    console.error("error while fetching '/api/getData', ", msg);
  }

  doBackClick = (): void => {
    this.setState({show: "log-in", user: undefined,
      schedule: undefined, friends: [], saved: false});
  }

  doEventAddClick = (event: EventStart): void => {
    if (this.state.schedule === undefined) {
      this.setState({schedule: [event], saved: false});
    } else {
      this.setState({schedule: this.state.schedule.concat([event]), saved: false});
    }
  }

  doEventRemoveClick = (schedule: Array<EventStart>): void => {
    this.setState({schedule: schedule, saved: false});
  }

  doSaveClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.schedule === undefined)
      throw new Error('impossible');

    const body = {
      user: this.state.user,
      schedule: jsonifySchedule(this.state.schedule),
      friends: jsonifyFriends(this.state.friends)
    };
    fetch("/api/setData", {method: 'POST', body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}})
      .then(this.doSaveResp)
      .catch(this.doSaveError);
  }

  doSaveResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
         .then((msg: string) => this.doSaveError(`bad status code ${res.status}: ${msg}`))
         .catch(() => this.doSaveError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doSaveJson)
        .catch(() => this.doSaveError("Failed to parse response data as JSON"))
    }
  }

  doSaveJson = (data: unknown): void => {
    if (!isRecord(data) || typeof data.saved !== "boolean") {
      this.doSaveError("response is not in expected form");
      return;
    }

    if (data.saved === true)
      this.setState({saved: true});
  }

  doSaveError = (msg: string): void => {
    console.error("error while fetching '/api/setData', ", msg);
  }

  doSaveFriendsClick = (updated: Map<string, boolean>): void => {
    const newFriends = new Array<string> ()
    for (const user of updated.keys()) {
      if (updated.get(user)) {
        newFriends.push(user)
      }
    }

    this.setState({
      friends: newFriends
    })
  }
} 