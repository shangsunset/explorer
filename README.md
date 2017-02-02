# Code Challenge (Node v6)

## Run

```
npm install && npm start
```

## Thought process

Based on the description, first thing you realize is that its a graph problem. So you need to traverse the graph and get writings from some nodes(rooms). Because you have multiple dones, the goal is to guide them to traverse the graph asynchronously.

Since the problem is not about looking for shortest path, it doesnt really matter if the traversal is Depth First Search or Breath First Search. I will use DFS here. `this.rooms` is a `stack` to hold discovered rooms, `this.visited` is a `set` to hold rooms have been visited.

The first step is to call endpoint `/start` to get a `roomId` as the root and drones in `startMission()`. The idea is to assign drones to visit each node asynchronously. Because visiting each node is an asynchronous action here and each asynchronous operation returns a `promise`, we can use `Promise.all` to combine all the `promises` so they can be executed in parallel.

When assigning a drone to explore a room, first check if the stack is empty or not. After popping a room from the top of the stack, first check if the `roomId` is `undefined` or not because the graph is being traversed asynchronously, there might chances that all the rooms have been assigned to drones to explore but no new connections have been discovered within the while loop. If the stack is empty at that moment, popped `roomId` will be `undefined`. Besides checking whether its `undefined`, be sure to check if the room has been visited or not.

When visiting each room/node, in `deployDroneToRoom(droneId, roomId)`, make a POST request with `roomId` to explore and read. In `handleExplorationResult()`, push newly discovered rooms onto the stack and store new writings to array `this.writings` is the order is not -1.

After visiting all the rooms, turning writings in `this.writings` into a string and make a POST request to `/report` in `report()` method.

