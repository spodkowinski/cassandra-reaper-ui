import React from "react";
import $ from "jquery"


const repairForm = React.createClass({

  propTypes: {
    addRepairSubject: React.PropTypes.object.isRequired,
    addRepairResult: React.PropTypes.object.isRequired,
    clusterNames: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      addRepairResultMsg: null, clusterNames: [],
      clusterName: "", keyspace: "", tables: "", owner: "", segments: "",
      parallelism: "", intensity: "", cause: "", incrementalRepair: "false"
    };
  },

  componentWillMount: function() {
    this._repairResultSubscription = this.props.addRepairResult.subscribeOnNext(obs =>
      obs.subscribe(
        r => this.setState({addRepairResultMsg: null}),
        r => this.setState({addRepairResultMsg: r.responseText})
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
    this._repairResultSubscription.dispose();
    this._clusterNamesSubscription.dispose();
    $('[data-toggle="tooltip"]').tooltip('destroy');
  },

  _onAdd: function(e) {
    if(!this._validate()) return;
    const repair = {
      clusterName: this.state.clusterName, keyspace: this.state.keyspace,
      owner: this.state.owner
    };
    if(this.state.tables) repair.tables = this.state.tables;
    if(this.state.segments) repair.segmentCount = this.state.segments;
    if(this.state.parallelism) repair.repairParallelism = this.state.parallelism;
    if(this.state.intensity) repair.intensity = this.state.intensity;
    if(this.state.cause) repair.cause = this.state.cause;
    if(this.state.incrementalRepair) repair.incrementalRepair = this.state.incrementalRepair;

    // Force incremental repair to FALSE if empty
    if(!this.state.incrementalRepair) repair.incrementalRepair = "false";

    this.props.addRepairSubject.onNext(repair);
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
    var validation = {};
    var state = this.state;
    validation.fgClusterErrorClass = state.clusterName ? "" : "has-error";
    validation.fgKeyspaceErrorClass = state.keyspace ? "" : "has-error";
    validation.fgOwnerErrorClass = state.owner ? "" : "has-error";
    this.setState(validation);
    return state.keyspace && state.clusterName && state.owner;
  },

  render: function() {

    let addMsg = null;
    if(this.state.addRepairResultMsg) {
      addMsg = <div className="alert alert-danger" role="alert">{this.state.addRepairResultMsg}</div>
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
            <div className="form-group">
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
                  onChange={this._handleChange} id="in_owner" placeholder="owner name for the repair run (any string)"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_segments" className="col-sm-3 control-label">Segment count <i data-toggle="tooltip" data-placement="top" title="Defines the default amount of repair segments to create for newly registered Cassandra repair runs (token rings). When running a repair run by the Reaper, each segment is repaired separately by the Reaper process, until all the segments in a token ring are repaired. The count might be slightly off the defined value, as clusters residing in multiple data centers require additional small token ranges in addition to the expected. You can overwrite this value per repair run, when calling the Reaper." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="number" className="form-control" value={this.state.segments}
                  onChange={this._handleChange} id="in_segments" placeholder="amount of segments to create for repair"/>
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
                  min="0" max="1"
                  onChange={this._handleChange} id="in_intensity" placeholder="repair intensity"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="in_cause" className="col-sm-3 control-label">Cause <i data-toggle="tooltip" data-placement="top" title="Identifies the process, or cause the repair was started." className="fa fa-info-circle" aria-hidden="true"></i></label>
              <div className="col-sm-9 col-md-7 col-lg-5">
                <input type="text" className="form-control" value={this.state.cause}
                  onChange={this._handleChange} id="in_cause" placeholder="reason repair was started"/>
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
                <button type="button" className="btn btn-warning" onClick={this._onAdd}>Repair</button>
              </div>
            </div>
          </form>

      </div>
    </div>


    return (<div className="panel panel-default">
              <div className="panel-heading">
                <div className="panel-title">Repair</div>
              </div>
              <div className="panel-body">
                {addMsg}
                {form}
              </div>
            </div>);
  }
});

export default repairForm;
