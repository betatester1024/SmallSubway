function saveEverything() {
  // let exportStops=  JSON.stringify(stops);
  // rebuild connections.
  let allOut = {
    connections: null,
    stops: null,
    passengers:[],
    trains:[],
    lines:[],
    typesOnLine:[],
    adj:adj,
    asyncEvents:asyncEvents
  }
  for (let e of asyncEvents) {
    if (e.args[0]) e.args[0] = trains.indexOf(e.args[0]);
    if (e.args[1]) e.args[1] = stops.indexOf(e.args[1]);
  }
  let newConnections = [];
  for (let conn of connections) {
    newConnections.push({
      colour:conn.colour,
      lineID:conn.lineID,
      pendingRemove:conn.pendingRemove,
      from:stops.indexOf(conn.from),
      to:stops.indexOf(conn.to)
    })
  }
  allOut.connections = newConnections;
  let newStops = [];
  for (let stop of stops) {
    let newStop = {
      addedTime: stop.addedTime,
      capacity: stop.capacity,
      failing: stop.failing,
      failurePct: stop.failurePct,
      linesServed: Array.from(stop.linesServed),
      stopID: stop.stopID,
      toAdd: stop.toAdd,
      type: stop.type,
      waiting: [],
      x: stop.x,
      y: stop.y
    }
    for (let i=0; i<stop.waiting.length; i++) {
      newStop.waiting.push(passengers.indexOf(stop.waiting[i]));
    }
    newStops.push(newStop);
  }
  allOut.stops = newStops;
  for (let pass of passengers) {
    let newPass = {
      actionStatus:pass.actionStatus,
      from:stops.indexOf(pass.from),
      to:pass.to,
      route:pass.route,
      status:pass.status,
      stop:stops.indexOf(pass.stop),
      train:trains.indexOf(pass.train)
    };
    allOut.passengers.push(newPass);
  }
  for (let train of trains) {
    allOut.trains.push({
      cap: train.cap,
      colour: train.colour,
      from: stops.indexOf(train.from),
      lineID: train.lineID,
      passengers: [],
      pendingMove: train.pendingMove,
      pendingRemove:train.pendingRemove,
      percentCovered: train.percentCovered,
      revDir: train.revDir,
      startT: train.startT,
      status: train.status,
      to: stops.indexOf(train.to),
      x: train.x,
      y: train.y
    });
    for (let pass of train.passengers) {
      allOut.trains[allOut.trains.length-1].passengers.push(passengers.indexOf(pass));
    }
  }
  for (let line of lines) {
    let newLine = ({
      colour:line.colour,
      lineID:line.lineID,
      loopingQ: line.loopingQ,
      path: [],
      trains:[],
      stops:[],
    });
    for (let stop of line.path) {
      let idx = stops.indexOf(stop);
      newLine.path.push(idx);
      newLine.stops.push(idx);
    }
    for (let train of line.trains) {
      newLine.trains.push(trains.indexOf(train));
    }
    allOut.lines.push(newLine);
  }
  for (let el of typesOnLine) {
    allOut.typesOnLine.push(Array.from(el));
  }
  console.log(allOut);
  allOut.ticks = globalTicks;
  return JSON.stringify(allOut);
}

function importSave(saveFile) {
  let data = JSON.parse(saveFile);
  stops = [];
  trains = [];
  connections = [];
  passengers = [];
  lines = [];
  typesOnLine = [];
  adj = data.adj;
  asyncEvents = data.asyncEvents;
  
  globalTicks = data.ticks;
  for (let stop of data.stops) {
    stops.push(stop);
  }
  for (let train of data.trains) 
    trains.push(train);
  for (let i=0; i<data.typesOnLine.length; i++) {
    typesOnLine.push(new Set(data.typesOnLine[i]));
  }
  for (let line of data.lines) {
    lines.push(line);
  }
  for (let conn of data.connections) {
    connections.push(conn);
  }
  for (let pass of data.passengers) {
    passengers.push(pass);
  }
  for (let i=0; i<stops.length; i++) {
    for (let j=0; j<stops[i].waiting.length; j++) {
      stops[i].waiting[j] = passengers[stops[i].waiting[j]];
    }
    stops[i].linesServed = new Set(stops[i].linesServed);
  }
  for (let i=0; i<connections.length; i++) {
    connections[i].from = stops[connections[i].from];
    connections[i].to = stops[connections[i].to];
  }
  for (let i=0; i<trains.length; i++) {
    trains[i].from = stops[trains[i].from];
    trains[i].to = stops[trains[i].to];
    for (let j=0; j<trains[i].passengers.length; j++) {
      trains[i].passengers[j] = passengers[trains[i].passengers[j]];
    }
  }
  for (let i=0; i<lines.length; i++) {
    for (let j=0; j<lines[i].path.length; j++) {
      lines[i].path[j] = stops[lines[i].path[j]];
    }
    lines[i].stops = new Set(lines[i].stops);
  }
  for (let pass of passengers) {
    pass.from = stops[pass.from];
    // pass.to = stops[pass.to];
    pass.stop = stops[pass.stop];
    pass.train = trains[pass.train];
  }
  for (let e of asyncEvents) {
    if (e.args[0] != null) e.args[0] = trains[e.args[0]];
    if (e.args[1] != null) e.args[1] = stops[e.args[1]];
  }
  startTick = globalTicks;
}