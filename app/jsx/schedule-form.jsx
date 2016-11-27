import React from "react";


const scheduleForm = React.createClass({

  propTypes: {
    addScheduleSubject: React.PropTypes.object.isRequired,
    addScheduleResult: React.PropTypes.object.isRequired,
    clusterNames: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      addScheduleResultMsg: null, clusterNames: [],
      fgDateErrorClass: "", fgIntervalErrorClass: "", fgClusterErrorClass : "",
      fgTablesErrorClass: "", fgKeyspaceErrorClass: "",
      clusterName: "", keyspace: "", tables: "", owner: "", segments: "",
      parallelism: "", intensity: "", startTime: "", intervalDays: "", incrementalRepair: "false"
    };
  },

  componentWillMount: function() {
    this._scheduleResultSubscription = this.props.addScheduleResult.subscribeOnNext(obs =>
      obs.subscribe(
        r => this.setState({addScheduleResultMsg: null}),
        r => this.setState({addScheduleResultMsg: r.responseText})
      )
    );

    this._clusterNamesSubscription = this.props.clusterNames.subscribeOnNext(obs =>
      obs.subscribeOnNext(names => {
        this.setState({clusterNames: names});
        if(names.length == 1) this.setState({clusterName: names[0]});
      })
    );
  },

  componentWillUnmount: function() {
    this._scheduleResultSubscription.dispose();
    this._clusterNamesSubscription.dispose();
  },

  _onAdd: function(e) {
    if(!this._validate()) return;
    const schedule = {
      clusterName: this.state.clusterName, keyspace: this.state.keyspace,
      owner: this.state.owner, scheduleTriggerTime: this.state.startTime,
      scheduleDaysBetween: this.state.intervalDays
    };
    if(this.state.tables) schedule.tables = this.state.tables;
    if(this.state.segments) schedule.segmentCount = this.state.segments;
    if(this.state.parallelism) schedule.repairParallelism = this.state.parallelism;
    if(this.state.intensity) schedule.intensity = this.state.intensity;
    if(this.state.incrementalRepair){
      schedule.incrementalRepair = this.state.incrementalRepair;
    } else {
      schedule.incrementalRepair = "false";
    }

    this.props.addScheduleSubject.onNext(schedule);
  },

  _handleChange: function(e) {
    var v = e.target.value;
    var n = e.target.id.substring(3); // strip in_ prefix

    // update state
    const state = this.state;
    state[n] = v;
    this.replaceState(state);
    this._validate();
  },

  _validate: function() {
    // validate
    var validation = {};
    var state = this.state;
    validation.fgClusterErrorClass = state.clusterName ? "" : "has-error";
    validation.fgKeyspaceErrorClass = state.keyspace ? "" : "has-error";
    validation.fgOwnerErrorClass = state.owner ? "" : "has-error";
    validation.fgDateErrorClass = state.startTime ? "" : "has-error";
    validation.fgIntervalErrorClass = state.intervalDays ? "" : "has-error";
    this.setState(validation);
    return state.keyspace && state.clusterName && state.owner && state.startTime && state.intervalDays;
  },

  render: function() {

    let addMsg = null;
    if(this.state.addScheduleResultMsg) {
      addMsg = <div className="alert alert-danger" role="alert">{this.state.addScheduleResultMsg}</div>
    }

    const clusterItems = this.state.clusterNames.map(name =>
      <option key={name} value={name}>{name}</option>
    );

    const form = <div className="row">
        <div className="col-lg-12">

          <form className="form-horizontal form-condensed">

            <div className={'form-group ' + this.state.fgClusterErrorClass}>
              <label htmlFor="in_clusterName" className="col-sm-3 control-label">Cluster*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <select className="form-control" id="in_clusterName"
                  onChange={this._handleChange} value={this.state.clusterName}>
                  {clusterItems}
                </select>
              </div>
            </div>

            <div className={'form-group ' + this.state.fgKeyspaceErrorClass}>
              <label htmlFor="in_keyspace" className="col-sm-3 control-label">Keyspace*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" required className="form-control" value={this.state.keyspace}
                  onChange={this._handleChange} id="in_keyspace" placeholder="name of keyspace to repair"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgTablesErrorClass}>
              <label htmlFor="in_tables" className="col-sm-3 control-label">Tables</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" className="form-control" value={this.state.tables}
                  onChange={this._handleChange} id="in_tables" placeholder="table1, table2, table3"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgOwnerErrorClass}>
              <label htmlFor="in_owner" className="col-sm-3 control-label">Owner*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" required className="form-control" value={this.state.owner}
                  onChange={this._handleChange} id="in_owner" placeholder="owner name for the schedule (any string)"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_segments" className="col-sm-3 control-label">Segment count</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" className="form-control" value={this.state.segments}
                  onChange={this._handleChange} id="in_segments" placeholder="amount of segments to create for scheduled repair runs"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_parallelism" className="col-sm-3 control-label">Parallelism</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <select className="form-control" id="in_parallelism"
                  onChange={this._handleChange} value={this.state.parallelism}>
                  <option value=""></option>
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="PARALLEL">Parallel</option>
                  <option value="DATACENTER_AWARE">DC-Aware</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_intensity" className="col-sm-3 control-label">Repair intensity</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" className="form-control" value={this.state.intensity}
                  onChange={this._handleChange} id="in_intensity" placeholder="repair intensity for scheduled repair runs"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgDateErrorClass}>
              <label htmlFor="in_startTime" className="col-sm-3 control-label">Start time*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="datetime-local" required className="form-control"
                  onChange={this._handleChange} value={this.state.startTime} id="in_startTime"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgIntervalErrorClass}>
              <label htmlFor="in_intervalDays" className="col-sm-3 control-label">Interval in days*</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" required className="form-control" value={this.state.intervalDays}
                  onChange={this._handleChange} id="in_intervalDays" placeholder="amount of days to wait between scheduling new repairs, (e.g. 7 for weekly)"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_incrementalRepair" className="col-sm-3 control-label">Incremental</label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <select className="form-control" id="in_incrementalRepair"
                  onChange={this._handleChange} value={this.state.incrementalRepair}>
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                <button type="button" className="btn btn-success" onClick={this._onAdd}>Add Schedule</button>
              </div>
            </div>
          </form>

      </div>
    </div>


    return (<div className="panel panel-default">
              <div className="panel-heading">
                <div className="panel-title">Add schedule</div>
              </div>
              <div className="panel-body">
                {addMsg}
                {form}
              </div>
            </div>);
  }
});

export default scheduleForm;
