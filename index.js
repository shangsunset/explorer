import request from 'request-promise';

const URL = 'http://challenge2.airtime.com:10001';

class XCommanderControlPanel {

  constructor() {
    // a stack that tracks all the rooms discovered
    this.rooms = [];
    // tracks which room has been visited
    this.visited = new Set();
    this.drones = [];
    // writings that have been discovered
    this.writings = [];
  }

  async startMission() {
    const options = {
      uri: `${URL}/start`,
      headers: {
        "x-commander-email": "shangyeshen@challenge.com"
      },
      json: true,
    };

    const response = await request(options);
    return response;
  }

  async deployDroneToRoom(droneId, roomId) {
    // visit a room by making a POST request

    const options = {
      method: 'post',
      uri: `${URL}/drone/${droneId}/commands`,
      headers: {
        "x-commander-email": "shangyeshen@challenge.com"
      },
      body: {
        0: {
          "explore": roomId,
        },
        1: {
          "read": roomId
        }
      },
      json: true
    };

    try {
      const response = await request(options);
      this.visited.add(roomId);
      console.log(`visited room: ${roomId}, drone: ${droneId}`);
      return response;

    } catch (err) {

      if (err.statusCode === 400) {

        throw new Error(`Drone ${droneId} is busy already`);
      } else if (err.statusCode === 404) {

        throw new Error(`Drone ${droneId} is invalid`);
      }
    }
  }

  handleExplorationResult(response) {

    // add discovered rooms from connections to the room stack
    response[0]['connections'].forEach(roomId => {
      if (!this.visited.has(roomId)) {
        this.rooms.push(roomId);
      }
    });

    const writing = response[1]['writing'];
    const order = response[1]['order'];
    if (order !== -1) {
      // assign discovered writing to its index in this.writings
      // make the list big enough to hold the index first
      const tmp = new Array(order + 1);
      this.writings = this.writings.concat(tmp);
      this.writings[order] = writing;

    }
  }

  static async report(message) {
    const options = {

      uri: `${URL}/report`,
      method: 'post',
      headers: {
        'x-commander-email': 'shangyeshen@challenge.com',
      },
      body: {
        message,
      },
      json: true,

    };

    const response = await request(options);
    return response;
  }

  async explore() {

    // getting entrance room, a.k.a root
    let response = await this.startMission();

    this.rooms.push(response.roomId);
    this.drones = this.drones.concat(response.drones);

    while (this.rooms.length > 0) {
      
      // using Promise.all to make all promises executed concurrently
      await Promise.all(this.drones.map(async droneId => {
          
        // pop a 'room' off of the stack
        // if roomId is undefined that means the stack is currently empty
        const roomId = this.rooms.pop();
        if (typeof roomId !== 'undefined' && !this.visited.has(roomId)) {

          try {

            // visit a room
            response = await this.deployDroneToRoom(droneId, roomId);
            this.handleExplorationResult(response);

          } catch(err) {

            console.log(err.message);
            return;
          }
        }
      }));
    }

    console.log(`explored ${this.visited.size} rooms`);
    const message = this.writings.join('');
    console.log(`message: ${message}`);
    response = await this.report(message);
    console.log(response);
  }

}

const controlPanel = new XCommanderControlPanel();
controlPanel.explore();
