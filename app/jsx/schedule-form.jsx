import React from "react";
import $ from "jquery"


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

    // enable bootstrap tooltips for help texts
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  },

  componentWillUnmount: function() {
    this._scheduleResultSubscription.dispose();
    this._clusterNamesSubscription.dispose();
    $('[data-toggle="tooltip"]').tooltip('destroy');
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
              <label htmlFor="in_clusterName" className="col-sm-3 control-label">Cluster* <i data-toggle="tooltip" data-placement="top" title="Cluster registered in the UI" className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <select className="form-control" id="in_clusterName"
                  onChange={this._handleChange} value={this.state.clusterName}>
                  {clusterItems}
                </select>
              </div>
            </div>

            <div className={'form-group ' + this.state.fgKeyspaceErrorClass}>
              <label htmlFor="in_keyspace" className="col-sm-3 control-label">Keyspace* <i data-toggle="tooltip" data-placement="top" title="Keyspace to repair" className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" required className="form-control" value={this.state.keyspace}
                  onChange={this._handleChange} id="in_keyspace" placeholder="name of keyspace to repair"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgTablesErrorClass}>
              <label htmlFor="in_tables" className="col-sm-3 control-label">Tables <i data-toggle="tooltip" data-placement="top" title="The name of the targeted tables (column families) as comma separated list. If no tables given, then the whole keyspace is targeted." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" className="form-control" value={this.state.tables}
                  onChange={this._handleChange} id="in_tables" placeholder="table1, table2, table3"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgOwnerErrorClass}>
              <label htmlFor="in_owner" className="col-sm-3 control-label">Owner* <i data-toggle="tooltip" data-placement="top" title="Owner name for the run. This could be any string identifying the owner." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" required className="form-control" value={this.state.owner}
                  onChange={this._handleChange} id="in_owner" placeholder="owner name for the schedule (any string)"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_segments" className="col-sm-3 control-label">Segment count <i data-toggle="tooltip" data-placement="top" title="Defines the default amount of repair segments to create for newly registered Cassandra repair runs (token rings). When running a repair run by the Reaper, each segment is repaired separately by the Reaper process, until all the segments in a token ring are repaired. The count might be slightly off the defined value, as clusters residing in multiple data centers require additional small token ranges in addition to the expected. You can overwrite this value per repair run, when calling the Reaper." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" className="form-control" value={this.state.segments}
                  onChange={this._handleChange} id="in_segments" placeholder="amount of segments to create for scheduled repair runs"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_parallelism" className="col-sm-3 control-label">Parallelism <i data-toggle="tooltip" data-placement="top" title="Defines the default type of parallelism to use for repairs. Repair parallelism value must be one of: &quot;sequential&quot;, &quot;parallel&quot;, or &quot;datacenter_aware&quot;. If you try to use &quot;datacenter_aware&quot; in clusters that don't support it yet (older than 2.0.12), Reaper will fall back into using &quot;sequential&quot; for those clusters." className="fa fa-info-circle" aria-hidden="true"></i></label>
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
              <label htmlFor="in_intensity" className="col-sm-3 control-label">Repair intensity <i data-toggle="tooltip" data-placement="top" title="Repair intensity is a value between 0.0 and 1.0, but not zero. Repair intensity defines the amount of time to sleep between triggering each repair segment while running a repair run. When intensity is one, it means that Reaper doesn't sleep at all before triggering next segment, and otherwise the sleep time is defined by how much time it took to repair the last segment divided by the intensity value. 0.5 means half of the time is spent sleeping, and half running. Intensity 0.75 means that 25% of the total time is used sleeping and 75% running. This value can also be overwritten per repair run when invoking repairs." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" className="form-control" value={this.state.intensity}
                  onChange={this._handleChange} id="in_intensity" placeholder="repair intensity for scheduled repair runs"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgDateErrorClass}>
              <label htmlFor="in_startTime" className="col-sm-3 control-label">Start time* <i data-toggle="tooltip" data-placement="top" title="Defines the date and time for first scheduled trigger for the run." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="datetime-local" required className="form-control"
                  onChange={this._handleChange} value={this.state.startTime} id="in_startTime"/>
              </div>
            </div>
            <div className={'form-group ' + this.state.fgIntervalErrorClass}>
              <label htmlFor="in_intervalDays" className="col-sm-3 control-label">Interval in days* <i data-toggle="tooltip" data-placement="top" title="Defines the amount of days to wait between scheduling new repairs. For example, use value 7 for weekly schedule, and 0 for continuous." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" required className="form-control" value={this.state.intervalDays}
                  onChange={this._handleChange} id="in_intervalDays" placeholder="amount of days to wait between scheduling new repairs, (e.g. 7 for weekly)"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_incrementalRepair" className="col-sm-3 control-label">Incremental <i data-toggle="tooltip" data-placement="top" title="Defines if incremental repairs should be used for Cassandra 2.1+ (NOT available in Spotify Reaper version)" className="fa fa-info-circle" aria-hidden="true"></i></label>
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
