// TODO: Implement FriendsEditor

import React, { Component, /*MouseEvent*/ } from 'react';
import { Friends } from './friends';


type FriendsProps = {
  user: string;               // name of the current user
  friends?: Friends;          // list of friends of current user
  allUsers: Friends           // list of all users
  updateFriends: (newFriends: Map<string, boolean>) => void  // updates friends list in server
};

type FriendsState = {
  friends: Map<string, boolean>      // names and friend/unfriend statuses of friends
};


/** Component for displaying and editing the user's schedule. */
export class FriendsEditor extends Component<FriendsProps, FriendsState> {
  constructor(props: FriendsProps) {
    super(props);

    const friendMap: Map<string, boolean> = new Map();
    for (const user of this.props.allUsers) {
      if (this.props.friends?.includes(user)) {
        friendMap.set(user, true)
      } else {
        friendMap.set(user, false)
      }
    }
    this.state = { 
        friends: friendMap
    };
  }

  render = (): JSX.Element => {
    if (!this.props.friends) {
      return <p>Loading friends...</p>;
    } else {
      return (
        <div className="content">
            <p>Check those users who are your friends:</p>
            {this.renderFriends()}
            <p>Those users will see some information about your schedule.</p>
        </div>
      )
    }
  };

  renderFriends = (): JSX.Element[] => {
    const friendsList: JSX.Element[] = [];

    for (const user of this.props.allUsers) { 
        if (this.state.friends.get(user)) { // user and person are not friends
            friendsList.push(<div className={"friend"}>
                {user}
                <button className={"unfriend"} onClick={() => this.doFriendClick(user)}>Unfriend</button>
            </div>
            )
        } else { // user and person are friends
            friendsList.push(<div className={"friend"}>
                {user}
                <button className={"friend"} onClick={() => this.doFriendClick(user)}>Friend</button>
            </div>
            )
        }
    }

    return friendsList;
  };

  doFriendClick = (friend: string): void => {
    if (this.props.friends === undefined)
      throw new Error('impossible');
    
    const friendsList = this.state.friends
    friendsList.set(friend, !friendsList.get(friend))

    this.props.updateFriends(friendsList)

    this.setState({
        friends: friendsList
    })
  }
}