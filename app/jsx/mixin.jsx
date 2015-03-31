import React from "react";

export const RowDeleteMixin = {

  deleteButton: function() {
    return <button type="button" className="btn btn-xs btn-danger" onClick={this._onDelete}>Delete</button>
  },

  _onDelete: function(e) {
    this.props.deleteSubject.onNext({id: this.props.row.id, owner: this.props.row.owner});
  }

};

export const StatusUpdateMixin = {

  statusUpdateButton: function() {

    let toggleStatusCue = null;
    if(this.props.row.state == 'ACTIVE' || this.props.row.state == 'RUNNING') {
      toggleStatusCue = 'Stop';
    } else if(this.props.row.state == 'PAUSED' || this.props.row.state == 'NOT_STARTED') {
      toggleStatusCue = 'Activate';
    }
    let btnSetStatus = null;
    if(toggleStatusCue) {
      return <button type="button" className="btn btn-xs btn-success" onClick={this._onToggleStatus}>{toggleStatusCue}</button>
    }
  },

  _onToggleStatus: function(e) {
    let toStatus = null;
    if(this.props.row.state == 'ACTIVE' || this.props.row.state == 'RUNNING') {
      toStatus = 'PAUSED';
    } else if(this.props.row.state == 'PAUSED') {
      toStatus = 'ACTIVE';
    } else if(this.props.row.state == 'NOT_STARTED') {
      toStatus = 'RUNNING';
    }
    this.props.updateStatusSubject.onNext({id: this.props.row.id, state: toStatus});
  }

};

export const DeleteStatusMessageMixin = {

  componentWillMount: function() {
    this._deleteResultSubscription = this.props.deleteResult.subscribeOnNext(obs =>
      obs.subscribe(
        r => this.setState({deleteResultMsg: null}),
        r => this.setState({deleteResultMsg: r.responseText})
      )
    );
  },

  componentWillUnmount: function() {
    this._deleteResultSubscription.dispose();
  },

  deleteMessage: function() {
    if(this.state.deleteResultMsg) {
      return <div className="alert alert-danger" role="alert">{this.state.deleteResultMsg}</div>
    }
  }

};
